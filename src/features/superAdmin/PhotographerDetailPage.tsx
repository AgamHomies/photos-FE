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
    FileText
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3] flex items-center justify-center">
                <div className="text-[#8B7355] text-xl">טוען...</div>
            </div>
        );
    }

    if (error || !photographer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3] flex items-center justify-center">
                <div className="text-red-600">{error || 'Photographer not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3]" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-[#F0EBE3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/super-admin/dashboard')}
                            className="p-2 hover:bg-[#FAF9F6] rounded-xl transition-colors"
                        >
                            <ArrowRight className="w-5 h-5 text-[#8B7355]" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#8B7355]">פרטי צלם</h1>
                            <p className="text-sm text-[#8B7355]/70">{photographer.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Photographer Info Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#F0EBE3] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Info */}
                        <div>
                            <h3 className="text-lg font-bold text-[#8B7355] mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                פרטים אישיים
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-[#8B7355]/60 mb-1">אימייל</div>
                                    <div className="font-medium text-[#8B7355]">{photographer.email}</div>
                                </div>
                                {photographer.profile_name && (
                                    <div>
                                        <div className="text-sm text-[#8B7355]/60 mb-1">שם</div>
                                        <div className="font-medium text-[#8B7355]">{photographer.profile_name}</div>
                                    </div>
                                )}
                                {photographer.contact_email && (
                                    <div>
                                        <div className="text-sm text-[#8B7355]/60 mb-1">אימייל ליצירת קשר</div>
                                        <div className="font-medium text-[#8B7355]">{photographer.contact_email}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-[#8B7355]/60 mb-1">תאריך הצטרפות</div>
                                    <div className="font-medium text-[#8B7355]">
                                        {new Date(photographer.created_at).toLocaleDateString('he-IL')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div>
                            <h3 className="text-lg font-bold text-[#8B7355] mb-4">סטטיסטיקות</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">אירועים</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.total_events}
                                    </div>
                                    <div className="text-xs text-[#8B7355]/60 mt-1">
                                        {photographer.stats.active_events} פעילים
                                    </div>
                                </div>

                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Image className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">תמונות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.total_images}
                                    </div>
                                </div>

                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Download className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">הורדות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.total_downloads}
                                    </div>
                                </div>

                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">שמירות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.total_contact_saves}
                                    </div>
                                </div>

                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">צפיות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.total_views}
                                    </div>
                                </div>

                                <div className="bg-[#FAF9F6] p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#C4A882]" />
                                        <div className="text-xs text-[#8B7355]/60">טיוטות</div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#8B7355]">
                                        {photographer.stats.draft_events}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#F0EBE3]">
                    <h3 className="text-xl font-bold text-[#8B7355] mb-4">אירועים</h3>

                    {events.length === 0 ? (
                        <div className="text-center py-12 text-[#8B7355]/60">
                            אין אירועים
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-4 border border-[#F0EBE3] rounded-xl hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#8B7355] mb-1">{event.name}</h4>
                                            <div className="flex items-center gap-4 text-sm text-[#8B7355]/60">
                                                <span>{event.slug}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${event.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {event.status === 'active' ? 'פעיל' : 'טיוטה'}
                                                </span>
                                                <span>{new Date(event.created_at).toLocaleDateString('he-IL')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 text-sm">
                                        <div className="bg-[#FAF9F6] p-2 rounded-lg text-center">
                                            <div className="text-xs text-[#8B7355]/60 mb-1">תמונות</div>
                                            <div className="font-bold text-[#8B7355]">{event.image_count}</div>
                                        </div>
                                        <div className="bg-[#FAF9F6] p-2 rounded-lg text-center">
                                            <div className="text-xs text-[#8B7355]/60 mb-1">הורדות</div>
                                            <div className="font-bold text-[#8B7355]">{event.downloads}</div>
                                        </div>
                                        <div className="bg-[#FAF9F6] p-2 rounded-lg text-center">
                                            <div className="text-xs text-[#8B7355]/60 mb-1">שמירות</div>
                                            <div className="font-bold text-[#8B7355]">{event.contact_saves}</div>
                                        </div>
                                        <div className="bg-[#FAF9F6] p-2 rounded-lg text-center">
                                            <div className="text-xs text-[#8B7355]/60 mb-1">צפיות</div>
                                            <div className="font-bold text-[#8B7355]">{event.views}</div>
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
