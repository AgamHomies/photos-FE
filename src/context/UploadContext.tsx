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
    rate?: number;        // images uploaded per second (upload phase)
    etaSeconds?: number;  // estimated seconds remaining for the upload phase
}

interface UploadContextType {
    uploads: Record<string, UploadState>;
    startUpload: (eventId: string, files: File[], coverFile?: File) => Promise<void>;
    clearUpload: (eventId: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);


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
        // Initialize state
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
            // A. Upload Cover if exists
            if (coverFile) {
                updateUploadState(eventId, { stage: 'מעלה תמונת קאבר...' });
                const compressedCover = await compressImage(coverFile);
                const coverInfo = await BackendService.getPresignedCoverUrl(eventId, compressedCover.name, compressedCover.type);
                await BackendService.uploadToS3(coverInfo.uploadUrl, compressedCover);
                await BackendService.setCoverImage(eventId, coverInfo.photoId.toString());
            }

            // B. Upload Gallery Files
            if (files.length > 0) {
                const BATCH_SIZE = 250;
                const CONCURRENCY_LIMIT = 20;
                const COMPRESS_CONCURRENCY = 6; // canvas decode/encode is memory-heavy
                const totalFiles = files.length;

                // Each photo counts as two units of work: compress, then upload.
                // The bar fills smoothly across both phases (0-98%).
                const totalUnits = totalFiles * 2;
                let compressedCount = 0;
                let uploadedCount = 0;
                let uploadStartTime = 0; // ms, set when the first file actually uploads
                const bumpProgress = () => {
                    const p = Math.floor(((compressedCount + uploadedCount) / totalUnits) * 98);
                    updateUploadState(eventId, { progress: p });
                };

                // Helper for concurrency
                const runWithConcurrency = async (tasks: (() => Promise<any>)[], limit: number) => {
                    const results = [];
                    const executing: Promise<any>[] = [];
                    for (const task of tasks) {
                        const p = Promise.resolve().then(() => task());
                        results.push(p);
                        const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
                        executing.push(e);
                        if (executing.length >= limit) {
                            await Promise.race(executing);
                        }
                    }
                    return Promise.all(results);
                };

                for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
                    const chunk = files.slice(i, i + BATCH_SIZE);

                    // 1. Compress (downscale) this chunk client-side before uploading.
                    const compressTasks = chunk.map((f) => async () => {
                        const compressed = await compressImage(f);
                        compressedCount++;
                        bumpProgress();
                        // eslint-disable-next-line no-loop-func
                        updateUploadState(eventId, {
                            phase: 'preparing',
                            stage: `מכין תמונות (${compressedCount}/${totalFiles})...`
                        });
                        return compressed;
                    });
                    const compressedChunk: File[] = await runWithConcurrency(compressTasks, COMPRESS_CONCURRENCY);

                    // 2. Presign (filenames/types reflect the compressed output)
                    const fileInfos = compressedChunk.map(f => ({ filename: f.name, contentType: f.type }));
                    const { urls } = await BackendService.getPresignedUrls(eventId, fileInfos);

                    // 3. Upload to R2
                    if (uploadStartTime === 0) uploadStartTime = Date.now();
                    const uploadTasks = urls.map((urlInfo: any, index: number) => async () => {
                        await BackendService.uploadToS3(urlInfo.uploadUrl, compressedChunk[index]);
                        uploadedCount++;
                        bumpProgress();

                        const elapsedSec = (Date.now() - uploadStartTime) / 1000;
                        const rate = elapsedSec > 0 ? uploadedCount / elapsedSec : 0;
                        const remaining = totalFiles - uploadedCount;
                        const etaSeconds = rate > 0 ? Math.round(remaining / rate) : undefined;

                        // eslint-disable-next-line no-loop-func
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

                    const uploadedPhotoIds = await runWithConcurrency(uploadTasks, CONCURRENCY_LIMIT);

                    // 4. Confirm (all images in this chunk are uploaded, processing in background)
                    await BackendService.confirmUploads(eventId, uploadedPhotoIds);
                }
            }

            // Finish client-side upload and processing -> Set to 100%
            updateUploadState(eventId, {
                progress: 100,
                stage: 'ההעלאה הושלמה! התמונות עוברות סריקת פנים ברקע...',
                isUploading: false,
                phase: 'done',
                etaSeconds: undefined,
            });

            // Give it a moment then clear, to allow immediate refresh of UI
            setTimeout(() => {
                clearUpload(eventId);
            }, 1000);

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
