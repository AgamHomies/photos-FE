import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { Event, Photo } from '../../types';
import { CONFIG } from '../../config';
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
    XCircle,
    Copy,
    ExternalLink,
    X,
    FolderUp,
    Eye,
    Share2
} from 'lucide-react';
import EventPreviewModal from './components/EventPreviewModal';
import { useUpload } from '../../context/UploadContext';
import EventShareModal from './components/EventShareModal';
import { unsecuredCopyToClipboard } from '../../utils/clipboard';
import DuplicateModal from './components/DuplicateFilesModal';

const EventManagePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { uploads, startUpload } = useUpload();

    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Server Progress State (for 80-100% phase or when returning to page)
    const [serverProgress, setServerProgress] = useState(0);
    const [serverProgressStage, setServerProgressStage] = useState('');
    const hasStartedUpload = useRef(false);
    // Bridge flag: true from the moment client upload finishes until server-side
    // processing is confirmed done. Keeps the progress bar alive even if the first
    // getBatches call races ahead of batch creation.
    const [awaitingServer, setAwaitingServer] = useState(false);
    const emptyPollsRef = useRef(0);
    const prevUploading = useRef(false);
    const folderInputRef = useRef<HTMLInputElement>(null);

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

    const [linkModal, setLinkModal] = useState<{
        isOpen: boolean;
        type: 'guest' | 'couple' | 'preview';
        url: string;
        title: string;
    }>({ isOpen: false, type: 'guest', url: '', title: '' });

    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Duplicate detection state
    const [duplicateModal, setDuplicateModal] = useState<{
        isOpen: boolean;
        duplicates: any[];
        totalFiles: number;
        files: File[];
    }>({ isOpen: false, duplicates: [], totalFiles: 0, files: [] });

    const handleLinkClick = (type: 'guest' | 'couple') => {
        if (!event) return;
        const path = type === 'guest' ? event.slug || event.id : event.coupleSlug || event.id;
        // Use frontend route instead of backend proxy
        const url = `${window.location.origin}/gallery/${path}`;
        setLinkModal({
            isOpen: true,
            type,
            url,
            title: type === 'guest' ? 'קישור לאורחים' : 'קישור לבעלי האירוע'
        });
    };

    const copyLink = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(linkModal.url);
                showNotification('הקישור הועתק בהצלחה');
                setLinkModal(prev => ({ ...prev, isOpen: false }));
            } catch (err) {
                console.warn('Clipboard API failed, trying fallback', err);
                unsecuredCopyToClipboard(linkModal.url);
                showNotification('הקישור הועתק בהצלחה');
                setLinkModal(prev => ({ ...prev, isOpen: false }));
            }
        } else {
            unsecuredCopyToClipboard(linkModal.url);
            showNotification('הקישור הועתק בהצלחה');
            setLinkModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    // Load photographer profile for sharing (handled within modal indirectly or via prop if needed, but keeping local state if used solely for that)
    // Actually EventShareModal takes photographerName prop.
    const [photographerName, setPhotographerName] = useState<string>('');

    useEffect(() => {
        const name = localStorage.getItem('photographerName');
        if (name) setPhotographerName(name);
    }, []);

    const shareEvent = () => {
        setShareModalOpen(true);
    };

    // Helper to check if processing is active
    const checkIsProcessing = (batchList: any[]) => {
        return batchList.some(b => b.status !== 'done' && b.status !== 'failed');
    };
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await BackendService.getProfile();
                if (profile?.name) {
                    localStorage.setItem('photographerName', profile.name);
                }
            } catch (error) {
                console.error('Failed to load profile', error);
            }
        };
        loadProfile();
    }, []);

    // 1. Check for redirected upload state
    useEffect(() => {
        const state = location.state as { filesToUpload?: File[], coverFile?: File, isNewEvent?: boolean } | null;

        if (id) {
            // First load the event data so the user sees the page (not empty loading screen)
            loadEventData(id).then(() => {
                // If we have files to upload from creation flow, start uploading them NOW
                if (state?.filesToUpload && !hasStartedUpload.current) {
                    hasStartedUpload.current = true;
                    // Clear state immediately to prevent double upload
                    window.history.replaceState({}, document.title);

                    if (id) {
                        startUpload(id, state.filesToUpload, state.coverFile);
                    }
                }
            });
        }
    }, [id, location.state]);

    // 2. Watch for client upload completion to bridge into server-progress tracking
    useEffect(() => {
        const activeUpload = id ? uploads[id] : null;
        const isClientUploading = !!activeUpload?.isUploading;

        if (prevUploading.current && !isClientUploading && id) {
            // Client upload just finished. Flip on the bridge flag so the progress bar
            // stays visible and the poll keeps running until the server confirms done,
            // even if the first getBatches call beats batch creation.
            setAwaitingServer(true);
            emptyPollsRef.current = 0;
            setServerProgress(prev => (prev < 80 ? 80 : prev));
            setServerProgressStage('מסנכרן נתונים מהשרת...');
            loadEventData(id);
        }
        prevUploading.current = isClientUploading;
    }, [uploads, id]);

    // 3. Polling for Server-Side Processing.
    // Runs while batches are processing OR while we're bridging right after an upload.
    // Depends on the *boolean* processing state (not the batches array) so a single
    // stable interval is used instead of being torn down and rebuilt on every poll.
    const isServerProcessing = checkIsProcessing(batches);
    useEffect(() => {
        if (!id) return;
        const isClientUploading = !!uploads[id]?.isUploading;
        // Don't poll while the client is still pushing files to R2 (avoids conflict).
        if (isClientUploading) return;
        if (!isServerProcessing && !awaitingServer) return;

        setServerProgress(prev => (prev < 80 ? 80 : prev));

        const poll = async () => {
            try {
                const updatedBatches = await BackendService.getBatches(id);
                setBatches(updatedBatches);

                if (updatedBatches.length === 0) {
                    // Batch not visible yet (race) — keep bridging. Bail after ~60s so a
                    // failed confirm never hangs the bar forever.
                    emptyPollsRef.current += 1;
                    if (emptyPollsRef.current > 20) {
                        setAwaitingServer(false);
                        setServerProgress(0);
                        setServerProgressStage('');
                    }
                    return;
                }
                emptyPollsRef.current = 0;

                const stillProcessing = checkIsProcessing(updatedBatches);
                const total = updatedBatches.reduce((acc: number, b: any) => acc + b.totalImages, 0);
                const processed = updatedBatches.reduce((acc: number, b: any) => acc + b.processedImages, 0);

                if (stillProcessing) {
                    if (total > 0) {
                        // Cap at 99% while processing; only completion reaches 100%.
                        setServerProgress(80 + Math.min(19, Math.floor((processed / total) * 19)));
                        setServerProgressStage(`מעבד תמונות בשרת (${processed}/${total})...`);
                    } else {
                        setServerProgressStage('מסנכרן נתונים מהשרת...');
                    }
                    return;
                }

                // All batches finished — auto-publish if needed, reload, complete.
                try {
                    const processingStatus = await BackendService.getProcessingStatus(id);
                    if (processingStatus.initial_processing_done && !processingStatus.is_published) {
                        await BackendService.publishEvent(id);
                        showNotification('האירוע פורסם אוטומטית!', 'success');
                    }
                } catch (err) {
                    console.error("Auto-publish failed", err);
                }

                setServerProgress(100);
                setServerProgressStage('העיבוד הסתיים בהצלחה!');
                await loadEventData(id);
                setTimeout(() => {
                    setAwaitingServer(false);
                    setServerProgress(0);
                    setServerProgressStage('');
                }, 1500);
            } catch (e) {
                console.error("Polling error", e);
            }
        };

        poll(); // immediate tick so the first update doesn't wait 3s
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isServerProcessing, awaitingServer, uploads]);

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
                const isProcessing = checkIsProcessing(batchesData);
                if (isProcessing) {
                    const total = batchesData.reduce((acc: number, b: any) => acc + b.totalImages, 0);
                    const processed = batchesData.reduce((acc: number, b: any) => acc + b.processedImages, 0);
                    if (total > 0) {
                        const rawPct = processed / total;
                        setServerProgress(80 + Math.floor(rawPct * 20));
                        setServerProgressStage('ממשיך עיבוד מהשרת...');
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

        try {
            // 1. Check for duplicates by name against the server
            const filenames = files.map(f => f.name);
            console.log('Checking duplicates for:', filenames);
            const response = await BackendService.checkDuplicates(id, filenames);
            console.log('Server duplicates response:', response);
            const serverDuplicates = response.results.filter((res: any) => res.isDuplicate);

            // 2. Check for internal duplicates (within the selection itself)
            const internalDuplicates: any[] = [];
            const seenInSelection = new Set<string>();

            files.forEach(f => {
                const lowerName = f.name.toLowerCase().trim();
                if (seenInSelection.has(lowerName)) {
                    if (!internalDuplicates.find(d => d.filename.toLowerCase().trim() === lowerName)) {
                        internalDuplicates.push({
                            filename: f.name,
                            isDuplicate: true,
                            isInternal: true,
                            existingThumbnailUrl: URL.createObjectURL(f) // Local preview
                        });
                    }
                }
                seenInSelection.add(lowerName);
            });

            const allDuplicates = [...serverDuplicates, ...internalDuplicates];

            if (allDuplicates.length > 0) {
                setDuplicateModal({
                    isOpen: true,
                    duplicates: allDuplicates,
                    totalFiles: files.length,
                    files
                });
                return;
            }

            // No duplicates, proceed normally
            await startUpload(id, files, coverFile);
            showNotification('העלאה התחילה ברקע...');
        } catch (e) {
            console.error(e);
            showNotification('שגיאה בבדיקת כפילויות/העלאה', 'error');
        }
    };

    const handleDuplicateOption = async (option: 'skip' | 'replace' | 'both') => {
        setDuplicateModal(prev => ({ ...prev, isOpen: false }));
        const { files, duplicates } = duplicateModal;

        if (!id) return;

        let filesToUpload = [...files];

        if (option === 'skip') {
            const duplicateNames = new Set(duplicates.map(d => d.filename));
            filesToUpload = files.filter(f => !duplicateNames.has(f.name));

            if (filesToUpload.length === 0) {
                showNotification('כל התמונות כבר קיימות באירוע');
                return;
            }
        } else if (option === 'replace') {
            // Delete existing ones on server
            const photoIdsToDelete = duplicates.filter(d => d.existingPhotoId).map(d => d.existingPhotoId);
            try {
                if (photoIdsToDelete.length > 0) {
                    showNotification('מוחק גרסאות ישנות...', 'success');
                    await Promise.all(photoIdsToDelete.map(pid => BackendService.deleteEventPhoto(id, pid.toString())));
                }

                // Keep only one copy of internal duplicates
                const seen = new Set<string>();
                filesToUpload = files.filter(f => {
                    if (seen.has(f.name)) return false;
                    seen.add(f.name);
                    return true;
                });
            } catch (err) {
                console.error("Failed to delete some existing photos", err);
                showNotification('שגיאה במחיקת גרסאות קיימות, ממשיך בהעלאה בכל זאת', 'error');
            }
        } else if (option === 'both') {
            // Unify internal selection but keep all as new (both implies keeping server ones too)
            // Wait, both usually means "upload these and keep existing ones". 
            // Internal duplicates should still probably be unified to 1 per upload chunk unless they want literal duplicates.
            // Usually 'both' means 'don't delete/skip, just upload'.
        }

        try {
            await startUpload(id, filesToUpload);
            showNotification('העלאה התחילה ברקע...');
        } catch (e) {
            console.error(e);
            showNotification('שגיאה בהתחלת העלאה', 'error');
        }
    };

    // Helper to traverse directories recursively
    const scanFiles = async (entry: any): Promise<File[]> => {
        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file((file: File) => {
                    resolve([file]);
                });
            });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const allEntries: any[] = [];

            const readAllEntries = async (): Promise<any[]> => {
                return new Promise((resolve) => {
                    dirReader.readEntries(async (entries: any[]) => {
                        if (entries.length === 0) {
                            resolve(allEntries);
                        } else {
                            allEntries.push(...entries);
                            await readAllEntries();
                            resolve(allEntries);
                        }
                    });
                });
            };

            await readAllEntries();
            const promises = allEntries.map((e) => scanFiles(e));
            const files = await Promise.all(promises);
            return files.flat();
        }
        return [];
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const items = e.dataTransfer.items;
        const files: File[] = [];

        if (items) {
            const promises: Promise<File[]>[] = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry?.() || (item as any).getAsEntry?.();
                    if (entry) {
                        promises.push(scanFiles(entry));
                    } else {
                        const file = item.getAsFile();
                        if (file) promises.push(Promise.resolve([file]));
                    }
                }
            }
            const results = await Promise.all(promises);
            files.push(...results.flat());
        } else {
            files.push(...Array.from(e.dataTransfer.files));
        }

        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (files.length > 0 && imageFiles.length === 0) {
            showNotification('לא נמצאו תמונות בקבצים/תיקיות שנגררו', 'error');
            return;
        }

        if (imageFiles.length > 0) {
            handleBulkUpload(imageFiles);
        }
    };

    // Simple manual upload handler (for the "Upload More" button)
    const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));

            if (files.length > 0 && imageFiles.length === 0) {
                showNotification('לא נמצאו תמונות בתיקייה שנבחרה', 'error');
                return;
            }

            if (imageFiles.length > 0) {
                handleBulkUpload(imageFiles);
            }
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
    const activeUpload = id ? uploads[id] : null;
    const isClientUploading = activeUpload?.isUploading;

    // Combined State
    const showProgressBar = isClientUploading || isServerProcessing || awaitingServer;
    const currentProgress = isClientUploading ? activeUpload!.progress : serverProgress;
    const currentStage = isClientUploading ? activeUpload!.stage : serverProgressStage;

    const showLinks = !showProgressBar && (event.isPublished || event.initialProcessingDone) && event.status !== 'expired';

    return (
        <Layout>
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                    {/* Progress Bar (Visible if uploading or processing) */}
                    {showProgressBar && (
                        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                                    {currentStage || 'מעבד נתונים...'}
                                </span>
                                <span className="font-mono font-bold text-cyan-600">{currentProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${currentProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                {isClientUploading
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
                            <div className="flex gap-2 animate-fade-in">
                                <button
                                    onClick={() => handleLinkClick('guest')}
                                    className="justify-center px-3.5 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>לאורחים</span>
                                </button>
                                <button
                                    onClick={() => handleLinkClick('couple')}
                                    className="justify-center px-3.5 py-2 text-sm font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors flex items-center gap-2 border border-cyan-100"
                                >
                                    <Heart className="w-4 h-4" />
                                    <span>לבעלי האירוע</span>
                                </button>
                                <button
                                    onClick={shareEvent}
                                    className="justify-center px-3.5 py-2 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors flex items-center gap-2 border border-green-100"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>שתף</span>
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'photos' && (
                    <div className="space-y-8">
                        {/* Upload Section */}
                        <div
                            className={`bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center transition-all relative group ${isClientUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50 hover:border-cyan-500'}`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                id="manage-file-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleManualUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={!!isClientUploading}
                            />

                            {/* Hidden Folder Input */}
                            <input
                                type="file"
                                multiple
                                // @ts-ignore
                                webkitdirectory=""
                                // @ts-ignore
                                directory=""
                                onChange={handleManualUpload}
                                className="hidden"
                                ref={folderInputRef}
                                disabled={!!isClientUploading}
                            />

                            {isClientUploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-slate-400 animate-spin mb-4" />
                                    <p className="text-slate-600 font-bold text-lg">מעלה תמונות...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center relative z-20 pointer-events-none">
                                    <div className="bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-cyan-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">העלאת תמונות נוספות</h3>
                                    <p className="text-slate-500 mb-4">גרור לכאן תמונות או תיקיות או בחר אפשרות:</p>

                                    <div className="flex gap-4 pointer-events-auto">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('manage-file-input')?.click()}
                                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm"
                                        >
                                            בחר תמונות
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => folderInputRef.current?.click()}
                                            className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-lg font-bold hover:bg-cyan-100 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <FolderUp className="w-4 h-4" />
                                            בחר תיקייה
                                        </button>
                                    </div>
                                </div>
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
                        <form onSubmit={handleUpdateDetails}>
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        עריכת פרטי אירוע
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setLinkModal(prev => ({ ...prev, isOpen: true, type: 'preview' }))}
                                        className="bg-cyan-50 text-cyan-600 px-6 py-2 rounded-xl font-bold hover:bg-cyan-100 transition-colors flex items-center gap-2 shadow-sm text-sm border border-cyan-100"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>תצוגה מקדימה</span>
                                    </button>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-4">
                                        {/* Right Column: Details Inputs */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">שם האירוע</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
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
                                            </div>
                                        </div>

                                        {/* Left Column: Cover Image Upload */}
                                        <div className="flex flex-col h-full">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">תמונת קאבר</label>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group bg-slate-50 flex-1 w-full flex flex-col items-center justify-center">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0] && id) {
                                                            const file = e.target.files[0];
                                                            // Simple single cover upload
                                                            if (id) startUpload(id, [], file);
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={!!isClientUploading}
                                                />
                                                {event.coverImage ? (
                                                    <div className="absolute inset-2 rounded-lg overflow-hidden">
                                                        <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="text-white font-medium flex items-center gap-2">
                                                                <Upload className="w-5 h-5" />
                                                                <span>לחץ להחלפה</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-cyan-500 transition-colors shadow-sm">
                                                            <ImageIcon className="w-8 h-8" />
                                                        </div>
                                                        <p className="text-slate-600 font-medium text-lg">לחץ להעלאת תמונת קאבר</p>
                                                        <p className="text-slate-400 text-sm mt-2">או גרור תמונה לכאן</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Button (Full Width Bottom) */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full shadow-lg"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>שמור שינויים</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

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
            {/* Link Modal */}
            {linkModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setLinkModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${linkModal.type === 'guest' ? 'bg-slate-50 text-slate-600' : 'bg-pink-50 text-pink-500'}`}>
                                {linkModal.type === 'guest' ? (
                                    <Users className="w-7 h-7" />
                                ) : (
                                    <Heart className="w-7 h-7" />
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{linkModal.title}</h3>
                            <p className="text-slate-500 text-sm mb-6">בחר פעולה עבור הקישור</p>

                            {/* Buttons */}
                            <div className="w-full flex flex-col gap-3">
                                <button
                                    onClick={() => window.open(linkModal.url, '_blank')}
                                    className="w-full py-3 px-4 rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 font-bold hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>פתח בחלון חדש</span>
                                    <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={copyLink}
                                    className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                >
                                    <span>העתק קישור</span>
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <EventPreviewModal
                isOpen={linkModal.isOpen && linkModal.type === 'preview'}
                onClose={() => setLinkModal(prev => ({ ...prev, isOpen: false }))}
                data={{
                    name: editForm.name,
                    date: editForm.date,
                    location: editForm.location,
                    coverImage: event.coverImage
                }}
            />

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
                    <div className={`px-6 py-3 rounded-full shadow-xl border flex items-center gap-3 ${toast.type === 'success'
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

            {/* Share Modal */}
            <EventShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                event={event}
                photographerName={photographerName}
            />

            <DuplicateModal
                isOpen={duplicateModal.isOpen}
                duplicates={duplicateModal.duplicates}
                totalFiles={duplicateModal.totalFiles}
                onCancel={() => setDuplicateModal(prev => ({ ...prev, isOpen: false }))}
                onOptionSelected={handleDuplicateOption}
            />
        </Layout>
    );
};

export default EventManagePage;
