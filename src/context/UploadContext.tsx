import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BackendService } from '../services/backendService';
import { compressImage } from '../utils/imageCompression';

interface UploadState {
    progress: number;
    stage: string;
    isUploading: boolean;
    error?: string;
    phase?: 'preparing' | 'uploading' | 'processing' | 'done';
    uploadedCount?: number;
    totalCount?: number;
    rate?: number;
    etaSeconds?: number;
}

interface UploadContextType {
    uploads: Record<string, UploadState>;
    startUpload: (eventId: string, files: File[], coverFile?: File) => Promise<void>;
    clearUpload: (eventId: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

const withRetry = async <T,>(fn: () => Promise<T>, retries = 4): Promise<T> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            if (attempt === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt))); // 800ms, 1.6s, 3.2s
        }
    }
    throw new Error('unreachable');
};

const runWithConcurrency = async (tasks: (() => Promise<any>)[], limit: number) => {
    const results: Promise<any>[] = [];
    const executing: Promise<any>[] = [];
    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);
        const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) await Promise.race(executing);
    }
    return Promise.all(results);
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploads, setUploads] = useState<Record<string, UploadState>>({});

    const updateUploadState = (eventId: string, updates: Partial<UploadState>) => {
        setUploads(prev => ({
            ...prev,
            [eventId]: { ...prev[eventId], ...updates }
        }));
    };

    const clearUpload = useCallback((eventId: string) => {
        setUploads(prev => {
            const newUploads = { ...prev };
            delete newUploads[eventId];
            return newUploads;
        });
    }, []);

    const startUpload = useCallback(async (eventId: string, files: File[], coverFile?: File) => {
        setUploads(prev => ({
            ...prev,
            [eventId]: {
                progress: 0,
                stage: 'מתחיל העלאה...',
                isUploading: true,
                phase: 'preparing',
                uploadedCount: 0,
                totalCount: files.length,
            }
        }));

        try {
            // A. Upload Cover
            if (coverFile) {
                updateUploadState(eventId, { stage: 'מעלה תמונת קאבר...' });
                const compressedCover = await withRetry(() => compressImage(coverFile));
                const coverInfo = await withRetry(() => BackendService.getPresignedCoverUrl(eventId, compressedCover.name, compressedCover.type));
                await withRetry(() => BackendService.uploadToS3(coverInfo.uploadUrl, compressedCover));
                await withRetry(() => BackendService.setCoverImage(eventId, coverInfo.photoId.toString()));
            }

            // B. Upload Gallery Files
            if (files.length > 0) {
                const BATCH_SIZE = 50;          // small batches → less memory, smaller blast radius
                const CONCURRENCY_LIMIT = 8;    // concurrent S3 uploads
                const COMPRESS_CONCURRENCY = 4; // concurrent canvas decodes
                const totalFiles = files.length;

                const totalUnits = totalFiles * 2;
                let compressedCount = 0;
                let uploadedCount = 0;
                let uploadStartTime = 0;
                let failedCount = 0;

                const bumpProgress = () => {
                    const p = Math.floor(((compressedCount + uploadedCount) / totalUnits) * 98);
                    updateUploadState(eventId, { progress: p });
                };

                for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
                    const chunk = files.slice(i, i + BATCH_SIZE);

                    // 1. Compress — retry each image individually
                    const compressTasks = chunk.map((f) => async () => {
                        const compressed = await withRetry(() => compressImage(f));
                        compressedCount++;
                        bumpProgress();
                        updateUploadState(eventId, {
                            phase: 'preparing',
                            stage: `מכין תמונות (${compressedCount}/${totalFiles})...`
                        });
                        return compressed;
                    });
                    const compressedChunk: File[] = await runWithConcurrency(compressTasks, COMPRESS_CONCURRENCY);

                    // 2. Presign — retry the whole call
                    const fileInfos = compressedChunk.map(f => ({ filename: f.name, contentType: f.type }));
                    const { urls } = await withRetry(() => BackendService.getPresignedUrls(eventId, fileInfos));

                    // 3. Upload to R2 — retry each file individually
                    if (uploadStartTime === 0) uploadStartTime = Date.now();
                    const uploadTasks = urls.map((urlInfo: any, index: number) => async () => {
                        await withRetry(() => BackendService.uploadToS3(urlInfo.uploadUrl, compressedChunk[index]));
                        uploadedCount++;
                        bumpProgress();

                        const elapsedSec = (Date.now() - uploadStartTime) / 1000;
                        const rate = elapsedSec > 0 ? uploadedCount / elapsedSec : 0;
                        const remaining = totalFiles - uploadedCount;
                        const etaSeconds = rate > 0 ? Math.round(remaining / rate) : undefined;

                        updateUploadState(eventId, {
                            phase: 'uploading',
                            stage: `מעלה תמונות (${uploadedCount}/${totalFiles})...`,
                            uploadedCount,
                            totalCount: totalFiles,
                            rate,
                            etaSeconds,
                        });
                        return urlInfo.photoId;
                    });

                    let uploadedPhotoIds: any[];
                    try {
                        uploadedPhotoIds = await runWithConcurrency(uploadTasks, CONCURRENCY_LIMIT);
                    } catch (batchErr) {
                        // One batch failed after all retries — log and continue with next batch
                        console.error(`Batch ${i}-${i + chunk.length} failed:`, batchErr);
                        failedCount += chunk.length;
                        continue;
                    }

                    // 4. Confirm — retry the whole call
                    try {
                        await withRetry(() => BackendService.confirmUploads(eventId, uploadedPhotoIds));
                    } catch (confirmErr) {
                        console.error(`Confirm failed for batch ${i}-${i + chunk.length}:`, confirmErr);
                        // Images are in S3 — they won't be lost, just not face-processed yet
                    }
                }

                if (failedCount > 0) {
                    console.warn(`Upload finished with ${failedCount} failed images`);
                }
            }

            updateUploadState(eventId, {
                progress: 100,
                stage: 'ההעלאה הושלמה! התמונות עוברות סריקת פנים ברקע...',
                isUploading: false,
                phase: 'done',
                etaSeconds: undefined,
            });

            setTimeout(() => { clearUpload(eventId); }, 1000);

        } catch (error) {
            console.error(error);
            updateUploadState(eventId, {
                isUploading: false,
                error: error instanceof Error ? error.message : 'שגיאה בהעלאה או בעיבוד של תמונות'
            });
        }
    }, [clearUpload]);

    return (
        <UploadContext.Provider value={{ uploads, startUpload, clearUpload }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};
