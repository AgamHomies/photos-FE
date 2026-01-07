import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Calendar,
    Image,
    Download,
    Phone,
    Eye,
    User,
    Mail,
    FileText,
    Share2,
    Crown,
    Award,
    Star,
    MapPin
} from 'lucide-react';
import SuperAdminService, { PhotographerDetail, EventSummary } from '../../services/superAdminService';

const PhotographerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [photographer, setPhotographer] = useState<PhotographerDetail | null>(null);
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id]);

    const loadData = async (photographerId: number) => {
        try {
            setLoading(true);
            const [photographerData, eventsData] = await Promise.all([
                SuperAdminService.getPhotographerDetail(photographerId),
                SuperAdminService.getPhotographerEvents(photographerId),
            ]);
            setPhotographer(photographerData);
            setEvents(eventsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load photographer data');
        } finally {
            setLoading(false);
        }
    };

    const getPackageVisuals = (type?: string) => {
        const normalizedType = type?.toLowerCase();
        switch (normalizedType) {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900 text-xl">טוען...</div>
            </div>
        );
    }

    if (error || !photographer) {
        return (
            <div className="min-h-screen bg-gradient-to-br bg-gray-50 flex items-center justify-center">
                <div className="text-red-600">{error || 'Photographer not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/super-admin/dashboard')}
                            className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                            <ArrowRight className="w-5 h-5 text-gray-900" />
                        </button>
                        {photographer.logo_url && (
                            <img
                                src={photographer.logo_url}
                                alt="Logo"
                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">פרטי צלם</h1>
                            <p className="text-sm text-gray-900/70">{photographer.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Photographer Info Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                פרטים אישיים
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-900/60 mb-1">אימייל</div>
                                    <div className="font-medium text-gray-900">{photographer.email}</div>
                                </div>
                                {photographer.name && (
                                    <div>
                                        <div className="text-sm text-gray-900/60 mb-1">שם</div>
                                        <div className="font-medium text-gray-900">{photographer.name}</div>
                                    </div>
                                )}
                                {photographer.phone && (
                                    <div>
                                        <div className="text-sm text-gray-900/60 mb-1">טלפון</div>
                                        <div className="font-medium text-gray-900 text-right" dir="ltr">{photographer.phone}</div>
                                    </div>
                                )}
                                {photographer.address && (
                                    <div>
                                        <div className="text-sm text-gray-900/60 mb-1">כתובת</div>
                                        <div className="font-medium text-gray-900">{photographer.address}</div>
                                    </div>
                                )}
                                {photographer.contact_email && (
                                    <div>
                                        <div className="text-sm text-gray-900/60 mb-1">אימייל ליצירת קשר</div>
                                        <div className="font-medium text-gray-900">{photographer.contact_email}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-gray-900/60 mb-1">תאריך הצטרפות</div>
                                    <div className="font-medium text-gray-900">
                                        {new Date(photographer.created_at).toLocaleDateString('he-IL')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">סטטיסטיקות</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Calendar className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">אירועים</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_events}
                                    </div>
                                    <div className="text-xs text-gray-900/60 mt-1">
                                        {photographer.stats.active_events} פעילים
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-cyan-50 rounded-lg">
                                            <Image className="w-4 h-4 text-cyan-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">תמונות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_images.toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Download className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">הורדות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_downloads.toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Phone className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">שמירות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_contact_saves.toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Eye className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">כניסות אורחים</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_views.toLocaleString()}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-pink-50 rounded-lg">
                                            <Share2 className="w-4 h-4 text-pink-600" />
                                        </div>
                                        <div className="text-xs text-gray-900/60">כניסות לפרופיל</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {photographer.stats.total_social_traffic.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-900/60 mt-1">
                                        פייסבוק • אינסטגרם • טיקטוק
                                    </div>
                                </div>
                            </div>

                            {/* Package Stats Table */}
                            <div className="mt-4 border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 text-[10px] text-gray-400 font-medium mb-1 text-center uppercase">
                                    <div className="text-right pr-1">חבילה</div>
                                    <div>סה״כ</div>
                                    <div>פעילים</div>
                                </div>

                                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 text-xs py-1 border-b border-gray-100 items-center text-center">
                                    <div className="font-bold text-gray-700 text-right flex items-center justify-start gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>בסיס</span>
                                    </div>
                                    <div className="text-gray-900">{photographer.stats.stats_basic?.total || 0}</div>
                                    <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats.stats_basic?.active || 0}</div>
                                </div>

                                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 text-xs py-1 border-b border-gray-100 items-center text-center">
                                    <div className="font-bold text-cyan-600 text-right flex items-center justify-start gap-1">
                                        <Award className="w-3 h-3" />
                                        <span>פרימיום</span>
                                    </div>
                                    <div className="text-gray-900">{photographer.stats.stats_premium?.total || 0}</div>
                                    <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats.stats_premium?.active || 0}</div>
                                </div>

                                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2 text-xs py-1 items-center text-center">
                                    <div className="font-bold text-amber-600 text-right flex items-center justify-start gap-1">
                                        <Crown className="w-3 h-3 fill-current" />
                                        <span>זהב</span>
                                    </div>
                                    <div className="text-gray-900">{photographer.stats.stats_gold?.total || 0}</div>
                                    <div className="text-green-600 bg-green-50 rounded px-1">{photographer.stats.stats_gold?.active || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">אירועים</h3>

                    {events.length === 0 ? (
                        <div className="text-center py-12 text-gray-900/60">
                            אין אירועים
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="border border-blue-100 rounded-xl hover:shadow-md transition-shadow overflow-hidden flex items-stretch"
                                >
                                    {/* Full Height Strip with Icon */}
                                    <div className={`w-6 flex items-center justify-center shrink-0 ${(() => {
                                        const visuals = getPackageVisuals(event.package_type);
                                        return visuals.bg;
                                    })()}`}>
                                        {(() => {
                                            const visuals = getPackageVisuals(event.package_type);
                                            const Icon = visuals.icon;
                                            return <Icon className="w-3.5 h-3.5 text-white" />;
                                        })()}
                                    </div>

                                    <div className="flex-1 p-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900 mb-1 text-base">{event.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs ${event.status === 'ready' || event.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {event.status === 'ready' || event.status === 'active' ? 'פעיל' : 'טיוטה'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-900/60 mt-0.5">
                                            <span>{event.slug}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(event.created_at).toLocaleDateString('he-IL')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 text-sm">
                                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                                            <div className="text-xs text-gray-900/60 mb-1">תמונות</div>
                                            <div className="font-bold text-gray-900">{event.image_count}</div>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                                            <div className="text-xs text-gray-900/60 mb-1">הורדות</div>
                                            <div className="font-bold text-gray-900">{event.downloads}</div>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                                            <div className="text-xs text-gray-900/60 mb-1">שמירות</div>
                                            <div className="font-bold text-gray-900">{event.contact_saves}</div>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                                            <div className="text-xs text-gray-900/60 mb-1">כניסות אורחים</div>
                                            <div className="font-bold text-gray-900">{event.views}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotographerDetailPage;


