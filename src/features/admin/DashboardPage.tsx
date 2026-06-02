import React, { useEffect, useRef, useState } from 'react';
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
    Zap,
    Crown,
    Award,
    Star,
    MapPin
} from 'lucide-react';
import { Toast } from '../../components';
import PackageSelectionModal from './components/PackageSelectionModal';
import EventShareModal from './components/EventShareModal';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const DEFAULT_STATS: DashboardStats = {
        totalDownloads: 0, totalPageVisits: 0, phoneSaves: 0, activeEvents: 0, expiredEvents: 0,
        totalEvents: 0, totalImages: 0, totalSocialTraffic: 0, trafficFacebook: 0,
        trafficInstagram: 0, trafficTiktok: 0, trafficWebsite: 0, avgDownloadsPerEvent: 0,
        avgPageVisitsPerEvent: 0, avgPhoneSavesPerEvent: 0, avgImagesPerEvent: 0,
        avgSocialTrafficPerEvent: 0, maxDownloadsPerEvent: 0, maxPageVisitsPerEvent: 0,
        maxPhoneSavesPerEvent: 0, maxImagesPerEvent: 0, maxSocialTrafficPerEvent: 0,
        totalLikes: 0, avgLikesPerEvent: 0, maxLikesPerEvent: 0,
        statsBasic: { total: 0, active: 0 }, statsPremium: { total: 0, active: 0 }, statsGold: { total: 0, active: 0 }
    };
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const displayStats = stats || DEFAULT_STATS;
    const [events, setEvents] = useState<Event[]>([]);
    const [globalLeads, setGlobalLeads] = useState<any[]>([]);
    const [totalLeadsCount, setTotalLeadsCount] = useState(0); // frozen at load, unaffected by deletes
    const [frozenLeadsPerEvent, setFrozenLeadsPerEvent] = useState<Record<string, number>>({}); // frozen per-event map
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [sortField, setSortField] = useState<keyof Event | 'downloads' | 'guestVisits' | 'photoCount' | 'likesCount' | 'profileVisits' | 'phoneSaves'>('createdAt');
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

    const getPackageVisuals = (type?: string) => {
        switch (type) {
            case 'premium':
                return {
                    bg: 'bg-cyan-500',
                    icon: Award,
                    label: 'פרימיום'
                };
            case 'gold':
                return {
                    bg: 'bg-amber-500',
                    icon: Crown,
                    label: 'זהב'
                };
            case 'basic':
            default:
                return {
                    bg: 'bg-slate-500',
                    icon: Star,
                    label: 'בסיס'
                };
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

            const response = await BackendService.getEvents(page, itemsPerPage, searchTerm, sortField, sortDirection, showActiveOnly ? 'ready' : undefined);
            setEvents(response.items);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            setTotalEvents(response.total);

            // Fetch stats only once? Or every time? keeping it here is fine.
            const statsData = await BackendService.getDashboardStats();
            setStats(statsData);

            // Fetch global leads
            const leadsData = await BackendService.getAllLeads();
            setGlobalLeads(leadsData);
            setTotalLeadsCount(leadsData.length); // frozen total — not affected by table deletes
            // Build frozen per-event count map
            const perEvent: Record<string, number> = {};
            leadsData.forEach((l: any) => { perEvent[l.event_id] = (perEvent[l.event_id] || 0) + 1; });
            setFrozenLeadsPerEvent(perEvent);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                navigate('/auth');
            }
        } finally {
            setLoading(false);
        }
    };

    // Guards against overlapping refreshes: if the backend is slow, a 5s
    // interval would otherwise stack pending requests and thrash re-renders.
    const isRefreshingRef = useRef(false);

    const silentRefresh = async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        try {
            const response = await BackendService.getEvents(currentPage, itemsPerPage, searchTerm, sortField, sortDirection);
            setEvents(response.items);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
        } catch (error) {
            console.error('Silent refresh failed:', error);
        } finally {
            isRefreshingRef.current = false;
        }
    };

    // Poll only while an event is still processing. Depend on the derived
    // boolean (not the events array) so the interval isn't torn down and
    // rebuilt on every fetch — it only flips when processing actually starts/stops.
    const hasProcessingEvents = events.some(e => !e.isPublished && !e.initialProcessingDone);

    useEffect(() => {
        if (!hasProcessingEvents) return;

        const intervalId = setInterval(silentRefresh, 5000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasProcessingEvents]);

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

    const handleToggleLeadContacted = async (eventId: string, leadId: number, checked: boolean) => {
        setGlobalLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_contacted: checked } : l));
        try {
            await BackendService.updateLeadStatus(eventId, leadId, checked);
        } catch (error) {
            console.error("Error toggling lead status:", error);
            triggerToast('שגיאה בעדכון סטטוס ליד', 'error');
            // Revert UI state on error
            setGlobalLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_contacted: !checked } : l));
        }
    };

    const handleDeleteLead = async (eventId: string | number, leadId: number, leadName: string) => {
        if (!window.confirm(`למחוק את הליד של ${leadName}?`)) return;
        setGlobalLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_deleted: true } : l));
        try {
            const ok = await BackendService.deleteLead(eventId, leadId);
            if (!ok) {
                // Revert on failure — refetch
                triggerToast('שגיאה במחיקת ליד', 'error');
                const fresh = await BackendService.getAllLeads();
                setGlobalLeads(fresh);
            } else {
                triggerToast('הליד נמחק בהצלחה!', 'success');
            }
        } catch (error) {
            console.error("Error deleting lead:", error);
            triggerToast('שגיאה במחיקת ליד', 'error');
            // Revert on failure — refetch
            const fresh = await BackendService.getAllLeads();
            setGlobalLeads(fresh);
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

    const handleSort = (field: keyof Event | 'downloads' | 'guestVisits' | 'photoCount' | 'likesCount' | 'profileVisits' | 'phoneSaves') => {
        const isToggle = sortField === field;
        const newDir = isToggle ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc';
        // Update state for UI indicator
        if (!isToggle) setSortField(field);
        setSortDirection(newDir);
        // Reload directly with explicit sort values to avoid stale closure
        setCurrentPage(1);
        setLoading(true);
        BackendService.getEvents(1, itemsPerPage, searchTerm, field, newDir)
            .then(response => {
                setEvents(response.items);
                setTotalPages(Math.ceil(response.total / itemsPerPage));
                setTotalEvents(response.total);
            })
            .catch(e => console.error('Sort reload failed:', e))
            .finally(() => setLoading(false));
    };

    // Server sorts globally - use events directly (no client-side re-sort)
    const sortedEvents = events;


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
            <div className="container mx-auto px-6 lg:px-12 py-8 max-w-[1100px]">
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
                                <Plus className="w-4 h-4" />
                                <span>צור אירוע חדש</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - 7 Columns on Desktop */}
                {true && (

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" style={{ "zoom": "0.9" }}>
                        {/* 1. אירועים */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            {/* Header - Icon & Title */}
                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-500 rounded-2xl shadow-sm border border-orange-100/50">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-100">סקירה כללית</span>
                            </div>

                            {/* Main Stat */}
                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                    {displayStats.totalEvents ?? 0}
                                    <span className="text-xl text-slate-300 font-light">/</span>
                                    <span className="text-2xl text-green-500">{displayStats.activeEvents ?? 0}</span>
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">סה״כ אירועים / פעילים</p>
                            </div>

                            {/* Footer - Package Stats */}
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100/50">
                                        <div className="flex justify-center items-center gap-1 text-slate-500 text-[10px] font-bold mb-1">
                                            <Star className="w-3 h-3 fill-current" /> בסיס
                                        </div>
                                        <div className="flex justify-center items-baseline gap-1">
                                            <span className="font-bold text-slate-900 text-sm">{displayStats.statsBasic?.total || 0}</span>
                                            <span className="text-[10px] text-green-500 font-semibold">({displayStats.statsBasic?.active || 0})</span>
                                        </div>
                                    </div>
                                    <div className="text-center p-2 rounded-xl bg-cyan-50/50 border border-cyan-100/50">
                                        <div className="flex justify-center items-center gap-1 text-cyan-600 text-[10px] font-bold mb-1">
                                            <Award className="w-3 h-3" /> פרימיום
                                        </div>
                                        <div className="flex justify-center items-baseline gap-1">
                                            <span className="font-bold text-slate-900 text-sm">{displayStats.statsPremium?.total || 0}</span>
                                            <span className="text-[10px] text-green-500 font-semibold">({displayStats.statsPremium?.active || 0})</span>
                                        </div>
                                    </div>
                                    <div className="text-center p-2 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                        <div className="flex justify-center items-center gap-1 text-amber-600 text-[10px] font-bold mb-1">
                                            <Crown className="w-3 h-3 fill-current" /> זהב
                                        </div>
                                        <div className="flex justify-center items-baseline gap-1">
                                            <span className="font-bold text-slate-900 text-sm">{displayStats.statsGold?.total || 0}</span>
                                            <span className="text-[10px] text-green-500 font-semibold">({displayStats.statsGold?.active || 0})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. תמונות */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            {/* Header - Icon */}
                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-500 rounded-2xl shadow-sm border border-cyan-100/50">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Main Stat */}
                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.totalImages || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">סה״כ תמונות שהועלו</p>
                            </div>

                            {/* Footer */}
                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxImagesPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgImagesPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. צפיות */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-purple-100 to-fuchsia-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-600 rounded-2xl shadow-sm border border-purple-100/50">
                                    <Eye className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.totalPageVisits || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">כניסות לגלריה</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxPageVisitsPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgPageVisitsPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 4. הורדות */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100 flex items-center gap-1" title="אחוז המרה מכניסות">
                                    {displayStats.totalPageVisits > 0 ? Math.round((displayStats.totalDownloads / displayStats.totalPageVisits) * 100) : 0}% המרה
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.totalDownloads || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">הורדות תמונות</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxDownloadsPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgDownloadsPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 5. שמירות איש קשר */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100/50">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-100 flex items-center gap-1" title="אחוז המרה מכניסות">
                                    {displayStats.totalPageVisits > 0 ? Math.round((displayStats.phoneSaves / displayStats.totalPageVisits) * 100) : 0}% המרה
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.phoneSaves || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">שמירות איש קשר</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxPhoneSavesPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgPhoneSavesPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 6. פרופיל ברשתות */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-600 rounded-2xl shadow-sm border border-pink-100/50">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-100 flex items-center gap-1" title="אחוז המרה מכניסות">
                                    {displayStats.totalPageVisits > 0 ? Math.round((displayStats.totalSocialTraffic / displayStats.totalPageVisits) * 100) : 0}% המרה
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.totalSocialTraffic || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">כניסות לפרופיל</p>
                                <p className="text-slate-400 text-xs mt-0.5">כניסה לרשתות החברתיות או לאתר</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxSocialTrafficPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgSocialTrafficPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 7. פרגונים (Likes) */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-rose-100 to-red-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-rose-50 to-red-50 text-rose-500 rounded-2xl shadow-sm border border-rose-100/50">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[11px] font-bold border border-rose-100 flex items-center gap-1">
                                    לייקים מתמונות
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {(displayStats.totalLikes || 0).toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">סה״כ פרגונים</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.maxLikesPerEvent || 0}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                    <p className="text-slate-800 font-bold text-sm">{displayStats.avgLikesPerEvent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* 8. לידים */}
                        <div className="group bg-white p-5 rounded-[1.25rem] shadow-sm hover:shadow-md border border-slate-100/60 hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-50 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-600 rounded-2xl shadow-sm border border-amber-100/50">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="relative flex-grow">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {totalLeadsCount.toLocaleString()}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">לידים שנאספו</p>
                            </div>

                            <div className="mt-3 flex gap-2">
                                {(() => {
                                    const counts = Object.values(frozenLeadsPerEvent) as number[];
                                    const max = counts.length ? Math.max(...counts) : 0;
                                    const avg = counts.length ? Math.round(counts.reduce((a: number, b: number) => a + b, 0) / counts.length) : 0;
                                    return (
                                        <>
                                            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">מקסימום לאירוע</p>
                                                <p className="text-slate-800 font-bold text-sm">{max}</p>
                                            </div>
                                            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ממוצע לאירוע</p>
                                                <p className="text-slate-800 font-bold text-sm">{avg}</p>
                                            </div>
                                        </>
                                    );
                                })()}
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

                    <div className="overflow-x-auto" style={{ "zoom": "0.9" }}>
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                                <tr>
                                    <th scope="col" className="w-12 p-0 rounded-tr-lg"></th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100 w-[240px]" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1">
                                            <span><span className="block">שם</span><span className="block">אירוע</span></span>
                                            {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            <span><span className="block">תאריך</span><span className="block">אירוע</span></span>
                                            {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>

                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center gap-1">
                                            <span><span className="block">תאריך</span><span className="block">יצירה</span></span>
                                            {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('photoCount')}>
                                        <div className="flex items-center gap-1">
                                            תמונות
                                            {sortField === 'photoCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('guestVisits')}>
                                        <div className="flex items-center gap-1">
                                            <span><span className="block">כניסות</span><span className="block">לגלריה</span></span>
                                            {sortField === 'guestVisits' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('downloads')}>
                                        <div className="flex items-center gap-1">
                                            הורדות
                                            {sortField === 'downloads' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('phoneSaves' as any)}>
                                        <div className="flex items-center gap-1">
                                            שמירות
                                            {sortField === 'phoneSaves' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('profileVisits' as any)}>
                                        <div className="flex items-center gap-1">
                                            <span><span className="block">כניסות</span><span className="block">לפרופיל</span></span>
                                            {sortField === 'profileVisits' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('likesCount' as any)}>
                                        <div className="flex items-center gap-1">
                                            פרגונים
                                            {sortField === 'likesCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('leadsCount' as any)}>
                                        <div className="flex items-center gap-1">
                                            לידים
                                            {sortField === 'leadsCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 w-64 text-center">לינק</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedEvents.map((event) => (
                                    <tr
                                        key={event.id}
                                        onClick={() => navigate(`/admin/events/${event.id}?tab=details`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        <td className={`p-0 w-12 text-center align-middle ${getPackageVisuals(event.packageType).bg}`}>
                                            <div className="flex items-center justify-center h-full min-h-[4rem]">
                                                {(() => {
                                                    const Icon = getPackageVisuals(event.packageType).icon;
                                                    return <Icon className="w-5 h-5 text-white/90" />;
                                                })()}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    {event.coverImage && !event.coverImage.includes('placeholder') ? (
                                                        <img
                                                            src={event.coverImage}
                                                            alt={event.name}
                                                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${event.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}
                                                        title={event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                                    ></div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors text-sm truncate max-w-[200px]"
                                                        title={event.name}
                                                    >
                                                        {event.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate max-w-[200px]">
                                                        <MapPin className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{event.location || 'ללא מיקום'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">{new Date(event.date).toLocaleDateString('he-IL')}</td>

                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                                            {event.createdAt ? new Date(event.createdAt).toLocaleDateString('he-IL') : '-'}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">{event.photoCount}</td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">{event.guestVisits}</td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">{event.downloads}</td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                                            {event.phoneSaves || event.stats?.contact_saved_count || 0}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                                            {(event as any).socialTrafficCount || 0}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                                            {(event as any).likesCount || 0}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm font-medium">
                                            {(event as any).leadsCount || 0}
                                        </td>
                                        <td className="px-5 py-4">
                                            {event.status === 'expired' ? (
                                                <div className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg flex items-center gap-1.5 border border-slate-200 justify-center cursor-not-allowed">
                                                    <X className="w-3 h-3" />
                                                    <span>לא זמין</span>
                                                </div>
                                            ) : (event.isPublished || event.initialProcessingDone) ? (
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

                                    </tr>
                                ))}
                                {sortedEvents.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-3 py-16 text-center text-slate-500">
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

                {/* Global Leads Section */}
                <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                <Users className="w-5 h-5" />
                            </div>
                            כל הלידים ({globalLeads.filter(l => !l.is_deleted).length})
                        </h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium whitespace-nowrap">
                                <tr>
                                    <th className="px-3 py-3">שם האורח</th>
                                    <th className="px-3 py-3">אירוע מקור</th>
                                    <th className="px-3 py-3">מספר טלפון</th>
                                    <th className="px-3 py-3">תאריך פנייה</th>
                                    <th className="px-3 py-3 text-center">מחיקה</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(() => {
                                    const activeLeads = globalLeads.filter(l => !l.is_deleted);
                                    return activeLeads.length > 0 ? activeLeads.map(lead => (
                                        <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors ${lead.is_contacted ? 'opacity-60' : ''}`}>
                                            <td className="px-6 py-5 text-slate-900 font-bold">{lead.name}</td>
                                            <td className="px-6 py-5 text-slate-600">{lead.event_name}</td>
                                            <td className="px-6 py-5">
                                                <a href={`tel:${lead.phone}`} className="text-cyan-600 hover:text-cyan-700 hover:underline inline-flex items-center gap-2 font-medium" dir="ltr">
                                                    {lead.phone}
                                                </a>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500 text-sm">
                                                {new Date(lead.created_at).toLocaleDateString('he-IL', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <button
                                                    onClick={() => handleDeleteLead(lead.event_id, lead.id, lead.name)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="מחק ליד"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users className="w-10 h-10 text-slate-200" />
                                                    <p>לא נמצאו לידים במערכת.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </table>
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
                                    <X className="w-4 h-4" />
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
