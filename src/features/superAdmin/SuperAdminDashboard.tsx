import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Image,
    Download,
    Phone,
    Eye,
    Search,
    LogOut,
    TrendingUp,
    Share2,
    Camera,
    Heart
} from 'lucide-react';
import SuperAdminService, { PlatformStats, PhotographerStats } from '../../services/superAdminService';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [photographers, setPhotographers] = useState<PhotographerStats[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [platformStats, photographersList] = await Promise.all([
                SuperAdminService.getPlatformStats(),
                SuperAdminService.getPhotographers(),
            ]);
            setStats(platformStats);
            setPhotographers(photographersList);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };



    const handleLogout = async () => {
        await SuperAdminService.logout();
        navigate('/super-admin/login');
    };

    const filteredPhotographers = photographers.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            p.email.toLowerCase().includes(searchLower) ||
            (p.name && p.name.toLowerCase().includes(searchLower))
        );
    });

    const handleExportCsv = async () => {
        try {
            await SuperAdminService.exportPhotographersCsv();
        } catch (err: any) {
            alert('Failed to export CSV: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900 text-xl">טוען...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">פאנל ניהול מערכת</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>התנתק</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Statistics Cards */}
                {stats && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

                            {/* Total Photographers */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-50 rounded-xl">
                                            <Camera className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_photographers}
                                    </h3>
                                    <p className="text-sm text-gray-600">צלמים במערכת</p>
                                </div>
                            </div>

                            {/* Total Events */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-orange-50 rounded-xl"><Calendar className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-8 mb-4">
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                                {stats.total_events}
                                            </h3>
                                            <p className="text-sm text-gray-600">סה״כ נוצרו</p>
                                        </div>
                                        <div className="border-r border-gray-100 pr-6">
                                            <h3 className="text-3xl font-bold text-green-600 mb-1">
                                                {stats.active_events}
                                            </h3>
                                            <p className="text-sm text-gray-600">פעילים</p>
                                        </div>
                                    </div>

                                    {/* Package Breakdown Table */}
                                    <div className="border-t border-gray-100 mt-4 pt-4">
                                        <div className="grid grid-cols-5 gap-2 text-[10px] text-gray-400 font-medium mb-2 text-center uppercase tracking-wider">
                                            <div className="text-right">חבילה</div>
                                            <div>סה״כ</div>
                                            <div>פעילים</div>
                                            <div>ממוצע</div>
                                            <div>מקס׳</div>
                                        </div>

                                        {/* Basic */}
                                        <div className="grid grid-cols-5 gap-2 text-xs py-1.5 border-b border-gray-50 items-center text-center">
                                            <div className="font-bold text-gray-600 text-right">Basic</div>
                                            <div className="font-medium text-gray-900">{stats.stats_basic.total}</div>
                                            <div className="text-green-600 font-medium bg-green-50 rounded-md py-0.5">{stats.stats_basic.active}</div>
                                            <div className="text-gray-500">{stats.stats_basic.avg_per_photographer}</div>
                                            <div className="text-gray-500">{stats.stats_basic.max_per_photographer}</div>
                                        </div>

                                        {/* Premium */}
                                        <div className="grid grid-cols-5 gap-2 text-xs py-1.5 border-b border-gray-50 items-center text-center">
                                            <div className="font-bold text-blue-600 text-right">Premium</div>
                                            <div className="font-medium text-gray-900">{stats.stats_premium.total}</div>
                                            <div className="text-green-600 font-medium bg-green-50 rounded-md py-0.5">{stats.stats_premium.active}</div>
                                            <div className="text-gray-500">{stats.stats_premium.avg_per_photographer}</div>
                                            <div className="text-gray-500">{stats.stats_premium.max_per_photographer}</div>
                                        </div>

                                        {/* Gold */}
                                        <div className="grid grid-cols-5 gap-2 text-xs py-1.5 items-center text-center">
                                            <div className="font-bold text-amber-600 text-right">Gold</div>
                                            <div className="font-medium text-gray-900">{stats.stats_gold.total}</div>
                                            <div className="text-green-600 font-medium bg-green-50 rounded-md py-0.5">{stats.stats_gold.active}</div>
                                            <div className="text-gray-500">{stats.stats_gold.avg_per_photographer}</div>
                                            <div className="text-gray-500">{stats.stats_gold.max_per_photographer}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ... (Total Images, Views, Downloads, Contact Saves remain same) ... */}

                            {/* Total Images */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-cyan-50 rounded-xl"><Image className="w-6 h-6 text-cyan-600" /></div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_images.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">תמונות</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_images_per_event}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.max_images_per_event.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Entries (Views) */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-50 rounded-xl"><Users className="w-6 h-6 text-purple-600" /></div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_views.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">כניסות אורחים</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_views_per_event}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.max_views_per_event.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Downloads */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-50 rounded-xl"><Download className="w-6 h-6 text-blue-600" /></div>
                                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                            {stats.download_rate_percent}% המרה
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_downloads.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">הורדות</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_downloads_per_event}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.max_downloads_per_event.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Saves */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-green-50 rounded-xl"><Phone className="w-6 h-6 text-green-600" /></div>
                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                            {stats.contact_save_rate_percent}% המרה
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_contact_saves.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">שמירות טלפון</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_contact_saves_per_event}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.max_contact_saves_per_event.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Entries */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-pink-50 rounded-xl"><Share2 className="w-6 h-6 text-pink-600" /></div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.total_social_traffic.toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">כניסות לפרופיל</p>
                                    <p className="text-xs text-gray-400 mb-4">פייסבוק • אינסטגרם • טיקטוק</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לצלם</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_social_traffic_per_photographer}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לצלם</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.max_social_traffic_per_photographer.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Likes (Paragonim) */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-rose-50 rounded-xl"><Heart className="w-6 h-6 text-rose-600" /></div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                        {(stats.total_likes || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">פרגונים</p>
                                    <p className="text-xs text-gray-400 mb-4">פרגונים על התמונות</p>

                                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">ממוצע לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{stats.avg_likes_per_event}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">מקסימום לאירוע</span>
                                            <span className="text-sm font-semibold text-gray-700">{(stats.max_likes_per_event || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Photographers Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">צלמים</h2>
                            <button
                                onClick={handleExportCsv}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
                            >
                                <Download className="w-4 h-4" />
                                <span>ייצוא ל-CSV</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-900/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="חפש לפי אימייל או שם"
                                    className="pr-10 pl-4 py-2 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Photographers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPhotographers.map((photographer) => (
                            <div
                                key={photographer.id}
                                onClick={() => navigate(`/super-admin/photographer/${photographer.id}`)}
                                className="p-4 border border-blue-100 rounded-xl hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{photographer.email}</h3>
                                        {photographer.name && (
                                            <p className="text-sm text-gray-600 mb-1">{photographer.name}</p>
                                        )}
                                        <p className="text-xs text-gray-900/60">
                                            הצטרף: {new Date(photographer.created_at).toLocaleDateString('he-IL')}
                                        </p>
                                    </div>
                                    {photographer.logo_url && (
                                        <img
                                            src={photographer.logo_url}
                                            alt="Logo"
                                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                                        />
                                    )}
                                </div>

                                {/* Package Stats Table */}
                                <div className="border border-gray-100 rounded-lg p-2 mb-3 bg-gray-50/50">
                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-medium mb-1 text-center uppercase">
                                        <div className="text-right">חבילה</div>
                                        <div>סה״כ</div>
                                        <div>פעילים</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-gray-100 items-center text-center">
                                        <div className="font-bold text-gray-700 text-right">Basic</div>
                                        <div className="text-gray-900">{photographer.stats_basic?.total || 0}</div>
                                        <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats_basic?.active || 0}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-gray-100 items-center text-center">
                                        <div className="font-bold text-blue-600 text-right">Premium</div>
                                        <div className="text-gray-900">{photographer.stats_premium?.total || 0}</div>
                                        <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats_premium?.active || 0}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs py-1 items-center text-center">
                                        <div className="font-bold text-amber-600 text-right">Gold</div>
                                        <div className="text-gray-900">{photographer.stats_gold?.total || 0}</div>
                                        <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats_gold?.active || 0}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">תמונות</div>
                                        <div className="font-bold text-gray-900">{photographer.total_images}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">אירועים פעילים</div>
                                        <div className="font-bold text-gray-900">{photographer.active_events}/{photographer.total_events}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">כניסות אורחים</div>
                                        <div className="font-bold text-gray-900">{photographer.total_views}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">שמירות</div>
                                        <div className="font-bold text-gray-900">{photographer.total_contact_saves}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">כניסות פרופיל</div>
                                        <div className="font-bold text-gray-900">{photographer.total_social_traffic || 0}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <div className="text-gray-900/60 mb-0.5 whitespace-nowrap">הורדות</div>
                                        <div className="font-bold text-gray-900">{photographer.total_downloads}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredPhotographers.length === 0 && (
                        <div className="text-center py-12 text-gray-900/60">
                            לא נמצאו צלמים
                        </div>
                    )}
                </div>
            </div>
        </div >
    );

};

export default SuperAdminDashboard;
