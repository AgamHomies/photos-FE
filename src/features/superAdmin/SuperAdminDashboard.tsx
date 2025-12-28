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
    FileText
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
            // If unauthorized, redirect to login
            if (err.message.includes('authenticated')) {
                navigate('/super-admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const results = await SuperAdminService.getPhotographers(searchQuery);
            setPhotographers(results);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogout = async () => {
        await SuperAdminService.logout();
        navigate('/super-admin/login');
    };

    const filteredPhotographers = photographers.filter((p) =>
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3] flex items-center justify-center">
                <div className="text-[#8B7355] text-xl">טוען...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3]" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-[#F0EBE3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#8B7355]">Super Admin Dashboard</h1>
                            <p className="text-sm text-[#8B7355]/70">פאנל ניהול מערכת</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Photographers */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_photographers}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">צלמים במערכת</p>
                        </div>

                        {/* Total Events */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-xs text-[#8B7355]/60">
                                    {stats.active_events} פעילים
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_events}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">אירועים</p>
                        </div>

                        {/* Total Images */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Image className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_images.toLocaleString()}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">תמונות</p>
                        </div>

                        {/* Total Downloads */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-50 rounded-xl">
                                    <Download className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_downloads.toLocaleString()}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">הורדות</p>
                        </div>

                        {/* Total Contact Saves */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-50 rounded-xl">
                                    <Phone className="w-6 h-6 text-pink-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_contact_saves.toLocaleString()}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">שמירות טלפון</p>
                        </div>

                        {/* Total Views */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                    <Eye className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.total_views.toLocaleString()}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">צפיות</p>
                        </div>

                        {/* Active Events */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.active_events}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">אירועים פעילים</p>
                        </div>

                        {/* Draft Events */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F0EBE3]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <FileText className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-[#8B7355] mb-1">
                                {stats.draft_events}
                            </h3>
                            <p className="text-sm text-[#8B7355]/70">טיוטות</p>
                        </div>
                    </div>
                )}

                {/* Photographers Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#F0EBE3]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#8B7355]">צלמים</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="חפש לפי אימייל..."
                                    className="pr-10 pl-4 py-2 border border-[#F0EBE3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4A882] text-[#8B7355]"
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
                                className="p-4 border border-[#F0EBE3] rounded-xl hover:shadow-lg hover:border-[#C4A882] transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#8B7355] mb-1">{photographer.email}</h3>
                                        <p className="text-xs text-[#8B7355]/60">
                                            הצטרף: {new Date(photographer.created_at).toLocaleDateString('he-IL')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                                        <div className="text-xs text-[#8B7355]/60 mb-1">אירועים</div>
                                        <div className="font-bold text-[#8B7355]">{photographer.total_events}</div>
                                    </div>
                                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                                        <div className="text-xs text-[#8B7355]/60 mb-1">תמונות</div>
                                        <div className="font-bold text-[#8B7355]">{photographer.total_images}</div>
                                    </div>
                                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                                        <div className="text-xs text-[#8B7355]/60 mb-1">הורדות</div>
                                        <div className="font-bold text-[#8B7355]">{photographer.total_downloads}</div>
                                    </div>
                                    <div className="bg-[#FAF9F6] p-2 rounded-lg">
                                        <div className="text-xs text-[#8B7355]/60 mb-1">צפיות</div>
                                        <div className="font-bold text-[#8B7355]">{photographer.total_views}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredPhotographers.length === 0 && (
                        <div className="text-center py-12 text-[#8B7355]/60">
                            לא נמצאו צלמים
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
