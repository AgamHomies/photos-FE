import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { Event, Photo } from '../../types';
import Layout from '../../components/Layout';
import {
    ArrowRight,
    Upload,
    Trash2,
    Star,
    Save,
    Loader2,
    Users,
    Heart,
    Image as ImageIcon,
    FileText,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const EventManagePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Upload & Progress State
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState('');
    const hasStartedUpload = useRef(false);

    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('tab') as 'photos' | 'details') || 'photos';
    const [activeTab, setActiveTab] = useState<'photos' | 'details'>(initialTab);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        date: '',
        location: ''
    });

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;

    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    // 1. Check for redirected upload state
    useEffect(() => {
        const state = location.state as { filesToUpload?: File[], coverFile?: File, isNewEvent?: boolean } | null;
        
        if (id && state?.filesToUpload && !hasStartedUpload.current) {
            hasStartedUpload.current = true;
            // Clear state immediately to prevent double upload on refresh (works in some routers, otherwise history replace)
            window.history.replaceState({}, document.title);
            
            handleBulkUpload(state.filesToUpload, state.coverFile);
        } else if (id) {
            loadEventData(id);
        }
    }, [id, location.state]);

    // 2. Polling for Server-Side Processing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const isServerProcessing = batches.some(b => b.status === 'processing');
        
        // Poll if we are NOT currently uploading from client (to avoid conflict) 
        // OR if we just finished upload and want to track server progress
        if (id && isServerProcessing && !uploading) {
            interval = setInterval(async () => {
                try {
                    const updatedBatches = await BackendService.getBatches(id);
                    setBatches(updatedBatches);
                    
                    // Calculate server-side progress
                    const total = updatedBatches.reduce((acc: number, b: any) => acc + b.totalImages, 0);
                    const processed = updatedBatches.reduce((acc: number, b: any) => acc + b.processedImages, 0);
                    
                    if (total > 0) {
                        const rawPct = processed / total;
                        const serverProgress = 80 + Math.floor(rawPct * 20);
                        // Only update main progress if we are not in client-upload mode
                        setProgress(serverProgress);
                        setProgressStage(`מעבד תמונות בשרת (${processed}/${total})...`);
                    }

                // If all became done, refresh photos/event and AUTO-PUBLISH
                if (!updatedBatches.some((b: any) => b.status === 'processing')) {
                    // Check if we need to publish
                    const processingStatus = await BackendService.getProcessingStatus(id);
                    if (processingStatus.initial_processing_done && !processingStatus.is_published) {
                         try {
                             await BackendService.publishEvent(id);
                             showNotification('האירוע פורסם אוטומטית!', 'success');
                         } catch (err) {
                             console.error("Auto-publish failed", err);
                         }
                    }
                    
                    loadEventData(id);
                    setProgress(100);
                    setProgressStage('העיבוד הסתיים בהצלחה!');
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
        }
        return () => clearInterval(interval);
    }, [batches, id, uploading]);

    const loadEventData = async (eventId: string) => {
        // Don't show full page loader if we are just refreshing data
        if (!event) setLoading(true); 
        
        try {
            const [eventData, photosData, batchesData] = await Promise.all([
                BackendService.getEvent(eventId),
                BackendService.getEventPhotos(eventId, 1, ITEMS_PER_PAGE),
                BackendService.getBatches(eventId)
            ]);

            if (eventData) {
                setEvent(eventData);
                setEditForm({
                    name: eventData.name,
                    date: eventData.date,
                    location: eventData.location
                });
                setPhotos(photosData);
                setBatches(batchesData);
                setPage(1);
                setHasMore(photosData.length === ITEMS_PER_PAGE);

                // Initial progress check
                const isProcessing = batchesData.some((b: any) => b.status === 'processing');
                if (isProcessing) {
                    const total = batchesData.reduce((acc: number, b: any) => acc + b.totalImages, 0);
                    const processed = batchesData.reduce((acc: number, b: any) => acc + b.processedImages, 0);
                    if (total > 0) {
                        const rawPct = processed / total;
                        setProgress(80 + Math.floor(rawPct * 20));
                        setProgressStage('ממשיך עיבוד מהשרת...');
                    }
                }
            } else {
                navigate('/admin');
            }
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async (files: File[], coverFile?: File) => {
        if (!id) return;
        
        setUploading(true);
        setProgress(0);
        
        try {
            // A. Upload Gallery Files
            if (files.length > 0) {
                const BATCH_SIZE = 100;
                const CONCURRENCY_LIMIT = 15;
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

                    setProgressStage(`מעלה נגלה ${currentBatchNum} מתוך ${totalBatches}...`);

                    // 1. Presign
                    const fileInfos = chunk.map(f => ({ filename: f.name, contentType: f.type }));
                    const { urls } = await BackendService.getPresignedUrls(id, fileInfos);

                    // 2. Upload to S3
                    const uploadTasks = urls.map((urlInfo, index) => async () => {
                        const file = chunk[index];
                        await BackendService.uploadToS3(urlInfo.uploadUrl, file);
                        return urlInfo.photoId;
                    });
                    
                    const uploadedPhotoIds = await uploadWithConcurrency(uploadTasks, CONCURRENCY_LIMIT);

                    // 3. Confirm
                    await BackendService.confirmUploads(id, uploadedPhotoIds);

                    processedCount += chunk.length;
                    // Client upload is 0-80% of total "perceived" progress, Server processing is the rest
                    const clientProgress = Math.floor((processedCount / totalFiles) * 80);
                    setProgress(clientProgress);
                }
            }

            // B. Upload Cover if exists
            if (coverFile) {
                setProgressStage('מעלה תמונת קאבר...');
                const coverInfo = await BackendService.getPresignedCoverUrl(id, coverFile.name, coverFile.type);
                await BackendService.uploadToS3(coverInfo.uploadUrl, coverFile);
                await BackendService.setCoverImage(id, coverInfo.photoId.toString());
            }

            // Refresh data to start server polling
            await loadEventData(id);
            showNotification(`העלאה הסתיימה בהצלחה! המערכת מעבדת את התמונות...`);

        } catch (error) {
            console.error(error);
            showNotification('שגיאה בהעלאת תמונות', 'error');
            setProgressStage('אירעה שגיאה בהעלאה');
        } finally {
            setUploading(false); // This will allow polling to take over for the 80-100% part
        }
    };

    // Simple manual upload handler (for the "Upload More" button)
    const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleBulkUpload(Array.from(e.target.files));
        }
    };

    const loadMorePhotos = async () => {
        if (!id || !hasMore) return;
        try {
            const nextPage = page + 1;
            const newPhotos = await BackendService.getEventPhotos(id, nextPage, ITEMS_PER_PAGE);
            if (newPhotos.length > 0) {
                setPhotos(prev => [...prev, ...newPhotos]);
                setPage(nextPage);
                setHasMore(newPhotos.length === ITEMS_PER_PAGE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more photos", error);
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (window.confirm('האם למחוק תמונה זו?') && id) {
            try {
                await BackendService.deleteEventPhoto(id, photoId);
                setPhotos(prev => prev.filter(p => p.id !== photoId));
                setEvent(prev => prev ? ({ ...prev, photoCount: Math.max(0, prev.photoCount - 1) }) : null);
            } catch (error) {
                showNotification('שגיאה במחיקת תמונה', 'error');
            }
        }
    };

    const handleSetCover = async (photoUrl: string) => {
        if (id && event) {
            try {
                const updated = await BackendService.updateEvent(id, { coverImage: photoUrl });
                setEvent(updated);
                showNotification('תמונת קאבר עודכנה בהצלחה');
            } catch (error) {
                showNotification('שגיאה בעדכון תמונת קאבר', 'error');
            }
        }
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            try {
                const updated = await BackendService.updateEvent(id, editForm);
                setEvent(updated);
                showNotification('פרטי האירוע עודכנו בהצלחה');
            } catch (error) {
                showNotification('שגיאה בעדכון פרטים', 'error');
            }
        }
    };

    const handleDeleteEvent = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו תמחק את כל הנתונים והתמונות לצמיתות.')) {
            if (id) {
                try {
                    await BackendService.deleteEvent(id);
                    navigate('/admin');
                } catch (error) {
                    showNotification('שגיאה במחיקת האירוע', 'error');
                }
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                </div>
            </Layout>
        );
    }

    if (!event) return null;

    // determine if we should show links
    // Show links if NOT uploading AND NOT processing (or checking batch status)
    // determine if we should show links
    // Show links if NOT uploading AND NOT processing (or checking batch status) AND (published OR initial done)
    // Actually, if we auto-publish, we just need to wait for the state to update.
    const isProcessing = batches.some(b => b.status === 'processing');
    const showLinks = !uploading && !isProcessing && (event.isPublished || event.initialProcessingDone);

    return (
        <Layout>
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    
                    {/* Progress Bar (Visible if uploading or processing) */}
                    {(uploading || isProcessing) && (
                        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                                    {progressStage || 'מעבד נתונים...'}
                                </span>
                                <span className="font-mono font-bold text-cyan-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {uploading 
                                    ? 'אנא אל תסגור את החלון עד סיום ההעלאה.' 
                                    : 'התמונות עוברות עיבוד בשרת. ניתן לערוך פרטים במקביל.'}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ArrowRight className="w-5 h-5 text-slate-500" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{event.name}</h1>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className={`w-2 h-2 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                    <span className="mx-1">•</span>
                                    <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Links - Only visible when done */}
                        {showLinks && (
                            <div className="flex gap-3 animate-fade-in">
                                <button
                                    onClick={() => window.open(`/gallery/${event.slug || event.id}`, '_blank')}
                                    className="w-32 justify-center px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>לאורחים</span>
                                </button>
                                <button
                                    onClick={() => window.open(`/gallery/${event.coupleSlug || event.id}`, '_blank')}
                                    className="w-32 justify-center px-4 py-2 text-sm font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors flex items-center gap-2 border border-cyan-100"
                                >
                                    <Heart className="w-4 h-4" />
                                    <span>לזוג</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-6 border-t border-slate-100 pt-2">
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'photos'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            ניהול תמונות
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            פרטי אירוע
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'photos' && (
                    <div className="space-y-8">
                        {/* Upload Section */}
                        <div className={`bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center transition-all relative group cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50 hover:border-cyan-500'}`}>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleManualUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-slate-400 animate-spin mb-4" />
                                    <p className="text-slate-600 font-bold text-lg">מעלה תמונות...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-cyan-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">העלאת תמונות נוספות</h3>
                                    <p className="text-slate-500">גרור לכאן תמונות או לחץ לבחירה</p>
                                </>
                            )}
                        </div>

                        {/* Photos Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                                    כל התמונות ({event.photoCount || photos.length})
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <img
                                            src={photo.thumbnailUrl || photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                            <button
                                                onClick={() => handleSetCover(photo.url)}
                                                className="p-3 bg-white/90 rounded-xl hover:bg-white text-amber-500 transition-colors shadow-lg transform hover:scale-105"
                                                title="קבע כתמונת קאבר"
                                            >
                                                <Star className="w-5 h-5 fill-current" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="p-3 bg-white/90 rounded-xl hover:bg-white text-red-500 transition-colors shadow-lg transform hover:scale-105"
                                                title="מחק תמונה"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Cover Indicator */}
                                        {event.coverImage === photo.url && (
                                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-lg font-bold shadow-sm flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                Cover
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={loadMorePhotos}
                                        className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                        <span>טען עוד תמונות</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    עריכת פרטי אירוע
                                </h2>
                            </div>
                            <form onSubmit={handleUpdateDetails} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">שם האירוע</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">תאריך</label>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                            className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">מיקום</label>
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                            className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                        />
                                    </div>

                                    {/* Cover Image Upload */}
                                    <div className="md:col-span-2 mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">תמונת קאבר</label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group bg-slate-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0] && id) {
                                                        try {
                                                            const file = e.target.files[0];
                                                            // Simple single cover upload
                                                            setUploading(true);
                                                            const coverInfo = await BackendService.getPresignedCoverUrl(id, file.name, file.type);
                                                            await BackendService.uploadToS3(coverInfo.uploadUrl, file);
                                                            await BackendService.setCoverImage(id, coverInfo.photoId.toString());
                                                            const updatedEvent = await BackendService.getEvent(id);
                                                            if (updatedEvent) setEvent(updatedEvent);
                                                            showNotification('תמונת קאבר עודכנה בהצלחה');
                                                        } catch (error) {
                                                            console.error(error);
                                                            showNotification('שגיאה בהעלאת תמונת קאבר', 'error');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={uploading}
                                            />
                                            {event.coverImage ? (
                                                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                                    <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-white font-medium flex items-center gap-2">
                                                            <Upload className="w-5 h-5" />
                                                            <span>לחץ להחלפה</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-cyan-500 transition-colors shadow-sm">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-slate-600 font-medium">לחץ להעלאת תמונת קאבר</p>
                                                    <p className="text-slate-400 text-sm mt-1">או גרור תמונה לכאן</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-slate-100">
                                    <button
                                        type="submit"
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>שמור שינויים</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div id="delete-section" className="mt-8 bg-red-50 rounded-3xl border border-red-100 p-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-red-900 font-bold text-lg mb-1">אזור מסוכן</h3>
                                    <p className="text-red-700 text-sm mb-6 max-w-lg">מחיקת האירוע היא פעולה בלתי הפיכה ותמחק את כל התמונות והנתונים הקשורים אליו.</p>
                                    <button
                                        onClick={handleDeleteEvent}
                                        className="text-red-600 hover:text-white font-bold text-sm border border-red-200 bg-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                                    >
                                        מחק את האירוע לצמיתות
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
                    <div className={`px-6 py-3 rounded-full shadow-xl border flex items-center gap-3 ${
                        toast.type === 'success' 
                            ? 'bg-slate-900 text-white border-slate-800' 
                            : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default EventManagePage;
