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
    Heart
} from 'lucide-react';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, []);



    const loadData = async () => {
        setLoading(true);
        try {
            const eventsData = await BackendService.getEvents();
            setEvents(eventsData);

            const statsData = await BackendService.getDashboardStats(eventsData);
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

    const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו תמחק את כל הנתונים והתמונות לצמיתות ולא ניתן יהיה לשחזר אותם.')) {
            try {
                await BackendService.deleteEvent(id);
                await loadData();
                alert('האירוע נמחק בהצלחה');
            } catch (error) {
                console.error('Failed to delete event:', error);
                alert('שגיאה במחיקת האירוע. אנא נסה שנית.');
            }
        }
    };

    let filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply active filter
    if (showActiveOnly) {
        filteredEvents = filteredEvents.filter(event => event.status === 'active');
    }

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

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
                    <button
                        onClick={() => navigate('/admin/create-event')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/30 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>צור אירוע חדש</span>
                    </button>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                    <Download className="w-6 h-6" />
                                </div>
                                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalDownloads.toLocaleString()}</h3>
                            <p className="text-slate-500 text-sm font-medium">סה"כ הורדות</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">+5%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalPageVisits.toLocaleString()}</h3>
                            <p className="text-slate-500 text-sm font-medium">כניסות לדפי אירועים</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="bg-green-50 p-3 rounded-xl w-fit mb-4 text-green-500">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.phoneSaves.toLocaleString()}</h3>
                            <p className="text-slate-500 text-sm font-medium">שמרו את המספר שלך</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="bg-orange-50 p-3 rounded-xl w-fit mb-4 text-orange-500">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.activeEvents}</h3>
                            <p className="text-slate-500 text-sm font-medium">אירועים פעילים</p>
                        </div>
                    </div>
                )}

                {/* Events Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    <th className="px-6 py-4 rounded-tr-2xl">שם אירוע</th>
                                    <th className="px-6 py-4">תאריך</th>
                                    <th className="px-6 py-4">תמונות</th>
                                    <th className="px-6 py-4">כניסות</th>
                                    <th className="px-6 py-4">הורדות</th>
                                    <th className="px-6 py-4">לינק ייחודי</th>
                                    <th className="px-6 py-4">סטטוס</th>
                                    <th className="px-6 py-4 rounded-tl-2xl">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedEvents.map((event) => (
                                    <tr
                                        key={event.id}
                                        onClick={() => navigate(`/admin/events/${event.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                                        {event.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{event.location || 'ללא מיקום'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{new Date(event.date).toLocaleDateString('he-IL')}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.photoCount}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.guestVisits}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{event.downloads}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/gallery/${event.id}`, '_blank');
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                                                    title="קישור לאורחים"
                                                >
                                                    <Users className="w-3 h-3" />
                                                    <span>לאורחים</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/gallery/${event.id}/full`, '_blank');
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1.5 border border-cyan-100"
                                                    title="קישור לזוג"
                                                >
                                                    <Heart className="w-3 h-3" />
                                                    <span>לזוג</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => navigate(`/admin/events/${event.id}`)}
                                                    className="p-2 hover:bg-cyan-50 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"
                                                    title="צפייה"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/events/${event.id}?tab=details#delete-section`);
                                                    }}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                    title="מחיקה"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedEvents.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
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
                        <div>מציג {paginatedEvents.length} מתוך {filteredEvents.length} אירועים</div>
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
            </div>
        </Layout>
    );
};

export default DashboardPage;
