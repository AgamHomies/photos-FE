import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BackendService } from '../../services/backendService';
import { DashboardStats, Event, PhotographerProfile } from '../../types';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Download,
    Users,
    Smartphone,
    AlertCircle,
    Plus,
    Trash2,
    Camera,
    Heart
} from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'settings'>('overview');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [profile, setProfile] = useState<PhotographerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Check if user has token before making requests
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('No auth token found, redirecting to login');
                navigate('/auth');
                return;
            }

            const [statsData, eventsData, profileData] = await Promise.all([
                BackendService.getDashboardStats(),
                BackendService.getEvents(),
                BackendService.getProfile()
            ]);
            setStats(statsData);
            setEvents(eventsData);
            setProfile(profileData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // If unauthorized, redirect to login
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                navigate('/auth');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
            await BackendService.deleteEvent(id);
            loadData();
        }
    };

    if (loading && !stats) {
        return <div className="min-h-screen flex items-center justify-center bg-stone-50">טוען נתונים...</div>;
    }

    return (
        <div className="min-h-screen bg-stone-50 flex font-sans text-stone-800" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-stone-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                    {profile?.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                            <Camera className="w-5 h-5 text-stone-500" />
                        </div>
                    )}
                    <div>
                        <h2 className="font-bold text-sm truncate w-32">{profile?.name || 'צלם'}</h2>
                        <p className="text-xs text-stone-500">לוח בקרה</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>סקירה כללית</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'events' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span>ניהול אירועים</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-amber-50 text-amber-600 font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span>הגדרות</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>התנתק</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-900">
                        {activeTab === 'overview' && 'סקירה כללית'}
                        {activeTab === 'events' && 'ניהול אירועים'}
                        {activeTab === 'settings' && 'הגדרות פרופיל'}
                    </h1>
                    {activeTab === 'events' && (
                        <button
                            onClick={() => navigate('/admin/create-event')}
                            className="bg-stone-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>אירוע חדש</span>
                        </button>
                    )}
                </header>

                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <span className="text-stone-400 text-sm">סה"כ</span>
                                </div>
                                <h3 className="text-3xl font-bold text-stone-900 mb-1">{stats.totalDownloads}</h3>
                                <p className="text-stone-500 text-sm">הורדות תמונות</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-stone-400 text-sm">סה"כ</span>
                                </div>
                                <h3 className="text-3xl font-bold text-stone-900 mb-1">{stats.totalPageVisits}</h3>
                                <p className="text-stone-500 text-sm">כניסות לאירועים</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className="text-stone-400 text-sm">לידים</span>
                                </div>
                                <h3 className="text-3xl font-bold text-stone-900 mb-1">{stats.phoneSaves}</h3>
                                <p className="text-stone-500 text-sm">שמרו טלפון</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <span className="text-stone-400 text-sm">סטטוס</span>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <span className="block text-xl font-bold text-stone-900">{stats.activeEvents}</span>
                                        <span className="text-xs text-stone-500">פעילים</span>
                                    </div>
                                    <div className="w-px bg-stone-200"></div>
                                    <div>
                                        <span className="block text-xl font-bold text-stone-900">{stats.expiredEvents}</span>
                                        <span className="text-xs text-stone-500">פג תוקף</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-stone-50 text-stone-500 text-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">שם האירוע</th>
                                        <th className="px-6 py-4 font-medium">תאריך</th>
                                        <th className="px-6 py-4 font-medium">תמונות</th>
                                        <th className="px-6 py-4 font-medium">אורחים</th>
                                        <th className="px-6 py-4 font-medium">הורדות</th>
                                        <th className="px-6 py-4 font-medium">סטטוס</th>
                                        <th className="px-6 py-4 font-medium">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {events.map((event) => (
                                        <tr
                                            key={event.id}
                                            onClick={() => navigate(`/admin/events/${event.id}`)}
                                            className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                                                    {event.name}
                                                </div>
                                                <div className="text-xs text-stone-400">{event.location}</div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600">{event.date}</td>
                                            <td className="px-6 py-4 text-stone-600">{event.photoCount}</td>
                                            <td className="px-6 py-4 text-stone-600">{event.guestVisits}</td>
                                            <td className="px-6 py-4 text-stone-600">{event.downloads}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => window.open(`/gallery/${event.id}`, '_blank')}
                                                        className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900"
                                                        title="קישור לאורחים"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/gallery/${event.id}/full`, '_blank')}
                                                        className="p-2 hover:bg-amber-50 rounded-lg text-stone-500 hover:text-amber-600"
                                                        title="קישור לזוג"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteEvent(event.id, e)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-stone-500 hover:text-red-600"
                                                        title="מחק אירוע"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {events.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                                                אין אירועים להצגה. צור אירוע חדש כדי להתחיל.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <h2 className="text-xl font-bold mb-6">הגדרות פרופיל</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">שם העסק</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.name}
                                    className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">תיאור</label>
                                <textarea
                                    defaultValue={profile?.bio}
                                    rows={3}
                                    className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">אימייל ליצירת קשר</label>
                                <input
                                    type="email"
                                    defaultValue={profile?.contactEmail}
                                    className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div className="pt-4 border-t border-stone-100">
                                <button type="button" className="bg-stone-900 text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors">
                                    שמור שינויים
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
