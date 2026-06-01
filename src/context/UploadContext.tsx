import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BackendService } from '../services/backendService';

interface UploadState {
    progress: number;
    stage: string;
    isUploading: boolean;
    error?: string;
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
                isUploading: true
            }
        }));

        try {
            // A. Upload Cover if exists
            if (coverFile) {
                updateUploadState(eventId, { stage: 'מעלה תמונת קאבר...' });
                const coverInfo = await BackendService.getPresignedCoverUrl(eventId, coverFile.name, coverFile.type);
                await BackendService.uploadToS3(coverInfo.uploadUrl, coverFile);
                await BackendService.setCoverImage(eventId, coverInfo.photoId.toString());
            }

            // B. Upload Gallery Files
            if (files.length > 0) {
                const BATCH_SIZE = 250;
                const CONCURRENCY_LIMIT = 20;
                let processedCount = 0;
                const totalFiles = files.length;

                // Helper for concurrency
                const uploadWithConcurrency = async (tasks: (() => Promise<any>)[], limit: number) => {
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
                    const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;
                    const totalBatches = Math.ceil(totalFiles / BATCH_SIZE);

                    updateUploadState(eventId, {
                        stage: `מתחיל העלאה חלק ${currentBatchNum} מתוך ${totalBatches}...`
                    });

                    // 1. Presign
                    const fileInfos = chunk.map(f => ({ filename: f.name, contentType: f.type }));
                    const { urls } = await BackendService.getPresignedUrls(eventId, fileInfos);

                    // 2. Upload to S3 and process
                    let completedInBatch = 0;
                    const uploadTasks = urls.map((urlInfo: any, index: number) => async () => {
                        const file = chunk[index];
                        // Upload file to R2
                        await BackendService.uploadToS3(urlInfo.uploadUrl, file);
                        
                        completedInBatch++;
                        // eslint-disable-next-line no-loop-func
                        const currentProcessed = processedCount + completedInBatch;
                        const currentProgress = Math.floor((currentProcessed / totalFiles) * 98);
                        
                        updateUploadState(eventId, {
                            progress: currentProgress,
                            stage: `מעלה תמונות (${currentProcessed}/${totalFiles})...`
                        });
                        
                        return urlInfo.photoId;
                    });

                    const uploadedPhotoIds = await uploadWithConcurrency(uploadTasks, CONCURRENCY_LIMIT);

                    // 3. Confirm (all images in this chunk are uploaded, processing in background)
                    await BackendService.confirmUploads(eventId, uploadedPhotoIds);

                    processedCount += chunk.length;
                    const chunkProgress = Math.floor((processedCount / totalFiles) * 98);
                    updateUploadState(eventId, { progress: chunkProgress });
                }
            }

            // Finish client-side upload and processing -> Set to 100%
            updateUploadState(eventId, {
                progress: 100,
                stage: 'ההעלאה הושלמה! התמונות עוברות סריקת פנים ברקע...',
                isUploading: false
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
