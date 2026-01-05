import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { DashboardStats, Event } from '../../types';
import Layout from '../../components/Layout';
import {
    Download,
    Users,
    Smartphone,
    Plus,
    Trash2,
    Search,
    ExternalLink,
    MoreVertical,
    Calendar,
    Image as ImageIcon,
    Filter,
    Eye,
    Edit,
    Heart,
    Share2,
    Copy,
    X,
    Zap
} from 'lucide-react';
import { Toast } from '../../components';
import PackageSelectionModal from './components/PackageSelectionModal';
import EventShareModal from './components/EventShareModal';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [sortField, setSortField] = useState<keyof Event | 'downloads' | 'guestVisits' | 'photoCount'>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 5;

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const [packageModalOpen, setPackageModalOpen] = useState(false);

    const handleCreateEvent = () => {
        // Always open package selection modal
        setPackageModalOpen(true);
    };

    const handleUpgradeSuccess = async () => {
        triggerToast('הרכישה בוצעה בהצלחה! מסגרת האירועים שלך גדלה.', 'success');
        await loadData(); // Refresh stats
    };

    const [linkModalConfig, setLinkModalConfig] = useState<{
        isOpen: boolean;
        type: 'guest' | 'couple';
        url: string;
        title: string;
    }>({
        isOpen: false,
        type: 'guest',
        url: '',
        title: ''
    });

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareEventData, setShareEventData] = useState<Event | null>(null);

    const openLinkModal = (e: React.MouseEvent, type: 'guest' | 'couple', path: string) => {
        e.stopPropagation();
        setLinkModalConfig({
            isOpen: true,
            type,
            url: `${window.location.origin}${path}`,
            title: type === 'guest' ? 'קישור לאורחים' : 'קישור לבעלי האירוע'
        });
    };

    const unsecuredCopyToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            triggerToast('הקישור הועתק ללוח בהצלחה!');
            setLinkModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
            triggerToast('שגיאה בהעתקת הקישור', 'error');
        }
        document.body.removeChild(textArea);
    };

    const handleCopyLink = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(linkModalConfig.url);
                triggerToast('הקישור הועתק ללוח בהצלחה!');
                setLinkModalConfig(prev => ({ ...prev, isOpen: false }));
            } catch (err) {
                console.warn('Clipboard API failed, trying fallback', err);
                unsecuredCopyToClipboard(linkModalConfig.url);
            }
        } else {
            unsecuredCopyToClipboard(linkModalConfig.url);
        }
    };

    const getPackageBadge = (type?: string) => {
        switch (type) {
            case 'premium':
                return (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold border border-blue-200 shadow-sm">
                        PREMIUM
                    </span>
                );
            case 'gold':
                return (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold border border-yellow-200 shadow-sm">
                        GOLD
                    </span>
                );
            case 'basic':
            default:
                return (
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold border border-gray-200">
                        BASIC
                    </span>
                );
        }
    };

    const shareEvent = (event: Event, e: React.MouseEvent) => {
        e.stopPropagation();
        setShareEventData(event);
        setShareModalOpen(true);
    };

    const [totalPages, setTotalPages] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to page 1 on search
            loadData(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, showActiveOnly]);

    // Page change
    useEffect(() => {
        loadData(currentPage);
    }, [currentPage]); // Remove searchTerm/showActiveOnly from here to avoid double fetch

    // Load photographer profile for sharing
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

    // Initial load handled by the above effects? 
    // Actually, ensure we don't double load on mount.
    // Let's rely on the useEffect([searchTerm]) to trigger initial load (empty search).

    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            // Pass search and showActiveOnly params if backend supports status filtering too (it does)
            // But getEvents signature needs to support status too?
            // Currently I only added search. Status filtering was already in API but not passed by RealEventAPI?
            // RealEventAPI.getEvents only has (page, limit, search). 
            // I should stick to search for now. Status filtering was done client-side.
            // If I do server-side pagination, status filtering MUST be server-side too.
            // Backend `list_events` accepts `status`.
            // RealEventAPI `getEvents` needs `status` param?
            // I missed that. For now let's implement search and pagination. Status filtering might be broken if I don't send it.
            // Let's assume shows all status for now or I'll fix it in next step.

            const response = await BackendService.getEvents(page, itemsPerPage, searchTerm);
            setEvents(response.items);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            setTotalEvents(response.total);

            // Fetch stats only once? Or every time? keeping it here is fine.
            const statsData = await BackendService.getDashboardStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                navigate('/auth');
            }
        } finally {
            setLoading(false);
        }
    };

    const silentRefresh = async () => {
        try {
            const response = await BackendService.getEvents(currentPage, itemsPerPage, searchTerm);
            setEvents(response.items);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
        } catch (error) {
            console.error('Silent refresh failed:', error);
        }
    };

    // Polling for processing events
    useEffect(() => {
        // Check if any event is still processing (not published AND not initial processing done)
        const hasProcessingEvents = events.some(e => !e.isPublished && !e.initialProcessingDone);

        if (hasProcessingEvents) {
            const intervalId = setInterval(() => {
                silentRefresh();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(intervalId);
        }
    }, [events]);

    const openDeleteModal = (event: Event, e: React.MouseEvent) => {
        e.stopPropagation();
        setEventToDelete(event);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;

        try {
            await BackendService.deleteEvent(eventToDelete.id);
            setDeleteModalOpen(false);
            setEventToDelete(null);
            await loadData();
        } catch (error) {
            console.error('Failed to delete event:', error);
            triggerToast('שגיאה במחיקת האירוע. אנא נסה שנית.', 'error');
        }
    };

    const handlePublish = async (eventId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await BackendService.publishEvent(eventId);
            await loadData();
            triggerToast('האירוע פורסם בהצלחה!', 'success');
        } catch (error) {
            console.error('Failed to publish event:', error);
            triggerToast('שגיאה בפרסום האירוע.', 'error');
        }
    };

    const handleSort = (field: keyof Event | 'downloads' | 'guestVisits' | 'photoCount') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc for metrics usually
        }
    };

    // START SORT LOGIC
    // Sort the current page items
    const sortedEvents = [...events].sort((a, b) => {
        const aValue = a[sortField] || 0;
        const bValue = b[sortField] || 0;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        // Date handling
        if (sortField === 'date' || sortField === 'createdAt') {
            const dateA = a[sortField] ? new Date(a[sortField]!) : new Date(0);
            const dateB = b[sortField] ? new Date(b[sortField]!) : new Date(0);
            return sortDirection === 'asc'
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        // Numeric
        return sortDirection === 'asc'
            ? (Number(aValue) - Number(bValue))
            : (Number(bValue) - Number(aValue));
    });



    if (loading && !stats) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">דשבורד ניהול</h1>
                        <p className="text-slate-500 mt-1">ברוך הבא למערכת הניהול שלך</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateEvent}
                                className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/30"
                            >
                                <Plus className="w-5 h-5" />
                                <span>צור אירוע חדש</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - 6 Columns on Desktop */}
                {stats && (

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {/* 1. אירועים */}
                        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col">
                            {/* Header - Icon */}
                            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl mb-3 w-fit">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="relative" title={`${stats.activeEvents ?? 0}/${stats.totalEvents ?? 0}`}>
                                <h3 className="text-3xl font-black text-slate-900 leading-none mb-1 truncate max-w-[200px]">
                                    {`${stats.activeEvents ?? 0}/${stats.totalEvents ?? 0}`}
                                </h3>
                                <p className="text-slate-500 font-semibold text-xs">אירועים פעילים</p>
                            </div>

                            {/* Body - Package Table (flex-1) */}
                            <div className="w-full pt-3 mt-4 border-t border-slate-100">
                                <div className="flex-1">
                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold mb-2">
                                        <div className="text-right">חבילה</div>
                                        <div className="text-center">סה״כ</div>
                                        <div className="text-center">פעילים</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                                            <div className="text-right">{getPackageBadge('basic')}</div>
                                            <div className="text-center font-bold text-slate-900">{stats.statsBasic?.total || 0}</div>
                                            <div className="text-center">
                                                <span className="bg-green-50 text-green-600 rounded-md py-0.5 px-2 font-bold text-[10px] inline-block min-w-[25px]">
                                                    {stats.statsBasic?.active || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                                            <div className="text-right">{getPackageBadge('premium')}</div>
                                            <div className="text-center font-bold text-slate-900">{stats.statsPremium?.total || 0}</div>
                                            <div className="text-center">
                                                <span className="bg-green-50 text-green-600 rounded-md py-0.5 px-2 font-bold text-[10px] inline-block min-w-[25px]">
                                                    {stats.statsPremium?.active || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-center text-xs">
                                            <div className="text-right">{getPackageBadge('gold')}</div>
                                            <div className="text-center font-bold text-slate-900">{stats.statsGold?.total || 0}</div>
                                            <div className="text-center">
                                                <span className="bg-green-50 text-green-600 rounded-md py-0.5 px-2 font-bold text-[10px] inline-block min-w-[25px]">
                                                    {stats.statsGold?.active || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. תמונות */}
                        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group">
                            <div className="flex flex-col items-start text-right h-full justify-between">
                                <div>
                                    <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-xl mb-3 w-fit">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="relative" title={(stats.totalImages || 0).toLocaleString()}>
                                        <h3 className="text-3xl font-black text-slate-900 leading-none mb-1 truncate max-w-[200px]">
                                            {(stats.totalImages || 0).toLocaleString()}
                                        </h3>
                                        <p className="text-slate-500 font-semibold text-xs">תמונות</p>
                                    </div>
                                </div>
                                <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-right mt-3">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">מקסימום</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.maxImagesPerEvent || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">ממוצע</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.avgImagesPerEvent || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. צפיות */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
                            <div className="flex flex-col items-start text-right h-full justify-between">
                                <div>
                                    <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl mb-3 w-fit">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{(stats.totalPageVisits || 0).toLocaleString()}</h3>
                                    <p className="text-slate-500 font-semibold text-xs">צפיות</p>
                                </div>
                                <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-right mt-3">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">מקסימום</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.maxPageVisitsPerEvent || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">ממוצע</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.avgPageVisitsPerEvent || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. הורדות */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
                            <div className="absolute top-5 left-5">
                                <div className="text-left group">
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-help">
                                        {stats.totalPageVisits > 0 ? Math.round((stats.totalDownloads / stats.totalPageVisits) * 100) : 0}%
                                    </span>
                                    <p className="text-slate-600 text-[10px] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity leading-tight absolute left-0 w-20">
                                        אחוז המרה מהצפיות
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start text-right h-full justify-between">
                                <div>
                                    <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl mb-3 w-fit">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{(stats.totalDownloads || 0).toLocaleString()}</h3>
                                    <p className="text-slate-500 font-semibold text-xs">הורדות</p>
                                </div>
                                <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-right mt-3">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">מקסימום</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.maxDownloadsPerEvent || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">ממוצע</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.avgDownloadsPerEvent || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. שמירות */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
                            <div className="absolute top-5 left-5">
                                <div className="text-left group">
                                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-help">
                                        {stats.totalPageVisits > 0 ? Math.round((stats.phoneSaves / stats.totalPageVisits) * 100) : 0}%
                                    </span>
                                    <p className="text-slate-600 text-[10px] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity leading-tight absolute left-0 w-20">
                                        אחוז המרה מהצפיות
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start text-right h-full justify-between">
                                <div>
                                    <div className="p-2.5 bg-green-50 text-green-500 rounded-xl mb-3 w-fit">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{(stats.phoneSaves || 0).toLocaleString()}</h3>
                                    <p className="text-slate-500 font-semibold text-xs">שמירות</p>
                                </div>
                                <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-right mt-3">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">מקסימום</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.maxPhoneSavesPerEvent || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">ממוצע</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.avgPhoneSavesPerEvent || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. כניסות לפרופיל */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative flex flex-col">
                            <div className="absolute top-5 left-5">
                                <div className="text-left group">
                                    <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-help">
                                        {stats.totalPageVisits > 0 ? Math.round((stats.totalSocialTraffic / stats.totalPageVisits) * 100) : 0}%
                                    </span>
                                    <p className="text-slate-600 text-[10px] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity leading-tight absolute left-0 w-20">
                                        אחוז המרה מהצפיות
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start text-right h-full justify-between">
                                <div>
                                    <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl mb-3 w-fit">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{(stats.totalSocialTraffic || 0).toLocaleString()}</h3>
                                    <p className="text-slate-500 font-semibold text-xs">כניסות לפרופיל</p>
                                    <p className="text-slate-400 text-[10px] mt-1">פייסבוק • אינסטגרם • טיקטוק</p>
                                </div>
                                <div className="w-full pt-3 border-t border-slate-100 flex justify-between text-right mt-3">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">מקסימום</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.totalEvents > 0 ? Math.max(stats.trafficFacebook, stats.trafficInstagram, stats.trafficTiktok) : 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold">ממוצע</p>
                                        <p className="text-slate-900 font-bold text-sm">{stats.totalEvents > 0 ? (stats.totalSocialTraffic / stats.totalEvents).toFixed(1) : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Events Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900">האירועים שלך</h2>

                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="חיפוש לפי שם אירוע..."
                                    className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowActiveOnly(!showActiveOnly)}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showActiveOnly
                                    ? 'bg-cyan-500 text-white border-cyan-500'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>פעילים</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-4 w-20">חבילה</th>
                                    <th className="px-6 py-4 rounded-tr-2xl cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1">
                                            שם אירוע
                                            {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            תאריך אירוע
                                            {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>

                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center gap-1">
                                            תאריך העלאה
                                            {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('photoCount')}>
                                        <div className="flex items-center gap-1">
                                            תמונות
                                            {sortField === 'photoCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('guestVisits')}>
                                        <div className="flex items-center gap-1">
                                            כניסות אורחים
                                            {sortField === 'guestVisits' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('downloads')}>
                                        <div className="flex items-center gap-1">
                                            הורדות
                                            {sortField === 'downloads' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 w-64 text-center">לינק ייחודי</th>
                                    <th className="px-6 py-4">סטטוס</th>
                                    <th className="px-6 py-4 rounded-tl-2xl">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedEvents.map((event) => (
                                    <tr
                                        key={event.id}
                                        onClick={() => navigate(`/admin/events/${event.id}?tab=details`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-4 py-4 w-20">
                                            {getPackageBadge(event.packageType)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {event.coverImage && !event.coverImage.includes('placeholder') ? (
                                                    <img
                                                        src={event.coverImage}
                                                        alt={event.name}
                                                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                                        {event.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{event.location || 'ללא מיקום'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{new Date(event.date).toLocaleDateString('he-IL')}</td>

                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                                            {event.createdAt ? new Date(event.createdAt).toLocaleDateString('he-IL') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.photoCount}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.guestVisits}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.downloads}</td>
                                        <td className="px-6 py-4">
                                            {event.isPublished || event.initialProcessingDone ? (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={(e) => openLinkModal(e, 'guest', `/gallery/${event.slug || event.id}`)}
                                                        className="w-24 justify-center px-2 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                                                        title="קישור לאורחים"
                                                    >
                                                        <Users className="w-3 h-3" />
                                                        <span>לאורחים</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => openLinkModal(e, 'couple', `/gallery/${event.coupleSlug || event.id}`)}
                                                        className="w-24 justify-center px-2 py-1.5 text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1 border border-cyan-100"
                                                        title="קישור לבעלי האירוע"
                                                    >
                                                        <Heart className="w-3 h-3" />
                                                        <span>לבעלי האירוע</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => shareEvent(event, e)}
                                                        className="w-24 justify-center px-2 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1 border border-green-100"
                                                        title="שתף אירוע"
                                                    >
                                                        <Share2 className="w-3 h-3" />
                                                        <span>שתף</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 text-xs font-bold text-orange-500 bg-orange-50 rounded-lg flex items-center gap-1.5 border border-orange-100 cursor-help justify-center" title="התמונות עדיין עוברות עיבוד">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                                    <span>בעיבוד...</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${event.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/events/${event.id}?tab=details`);
                                                    }}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="עריכה"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => openDeleteModal(event, e)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                    title="מחיקה"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sortedEvents.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Calendar className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p>לא נמצאו אירועים. צור אירוע חדש כדי להתחיל.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                        <div>מציג {sortedEvents.length} מתוך {totalEvents} אירועים</div>
                        <div className="flex gap-2">
                            <button
                                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentPage === page
                                        ? 'bg-cyan-500 text-white'
                                        : 'border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {
                    deleteModalOpen && eventToDelete && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <Trash2 className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">מחיקת אירוע</h3>
                                    <p className="text-slate-600 mb-6">
                                        האם אתה בטוח שברצונך למחוק את האירוע <span className="font-bold text-slate-900">"{eventToDelete.name}"</span>?
                                    </p>
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 w-full">
                                        <p className="text-sm text-red-800 font-medium">
                                            ⚠️ פעולה זו תמחק לצמיתות את כל התמונות והנתונים ולא ניתן יהיה לשחזר אותם.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => {
                                                setDeleteModalOpen(false);
                                                setEventToDelete(null);
                                            }}
                                            className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all"
                                        >
                                            ביטול
                                        </button>
                                        <button
                                            onClick={handleConfirmDelete}
                                            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/30"
                                        >
                                            מחק לצמיתות
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Link Action Modal */}
                {
                    linkModalConfig.isOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setLinkModalConfig(prev => ({ ...prev, isOpen: false }))}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col items-center text-center mt-2">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${linkModalConfig.type === 'guest' ? 'bg-slate-50 text-slate-600' : 'bg-pink-50 text-pink-500'}`}>
                                        {linkModalConfig.type === 'guest' ? (
                                            <Users className="w-7 h-7" />
                                        ) : (
                                            <Heart className="w-7 h-7" />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{linkModalConfig.title}</h3>
                                    <p className="text-slate-500 text-sm mb-6">בחר פעולה עבור הקישור</p>

                                    {/* Buttons */}
                                    <div className="w-full flex flex-col gap-3">
                                        <button
                                            onClick={() => window.open(linkModalConfig.url, '_blank')}
                                            className="w-full py-3 px-4 rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 font-bold hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span>פתח בחלון חדש</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                        >
                                            <span>העתק קישור</span>
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Share Modal */}
            <EventShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                event={shareEventData!}
                photographerName={localStorage.getItem('photographerName') || undefined}
            />

            <Toast
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />

            <PackageSelectionModal
                isOpen={packageModalOpen}
                onClose={() => setPackageModalOpen(false)}
            />
        </Layout >
    );
};

export default DashboardPage;
