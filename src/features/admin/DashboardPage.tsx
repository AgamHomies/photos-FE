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
    Filter
} from 'lucide-react';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);



    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, eventsData] = await Promise.all([
                BackendService.getDashboardStats(),
                BackendService.getEvents()
            ]);
            setStats(statsData);
            setEvents(eventsData);
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
        if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
            await BackendService.deleteEvent(id);
            loadData();
        }
    };

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
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
                                {filteredEvents.map((event) => (
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
                                            <div className="flex items-center gap-2 text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg w-fit text-xs font-medium dir-ltr cursor-pointer hover:bg-cyan-100" onClick={(e) => {
                                                e.stopPropagation();
                                                // Use the uniqueLink from the event object which points to the guest gallery
                                                const link = event.uniqueLink || `${window.location.origin}/gallery/${event.id}`;
                                                navigator.clipboard.writeText(link);
                                                alert('הקישור הועתק!');
                                            }}>
                                                <ExternalLink className="w-3 h-3" />
                                                {/* Display a friendly version, e.g. c2p.io/slug */}
                                                c2p.io/{event.uniqueLink ? event.uniqueLink.split('/').pop()?.slice(0, 6) : event.id.toString().slice(0, 6)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleDeleteEvent(event.id, e)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                    title="מחק אירוע"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEvents.length === 0 && (
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

                    {/* Pagination (Mock) */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                        <div>מציג {filteredEvents.length} מתוך {events.length} אירועים</div>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded-lg">1</button>
                            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50">2</button>
                            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;
