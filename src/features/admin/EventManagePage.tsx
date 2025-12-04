import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { Event, Photo } from '../../types';
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
    FileText
} from 'lucide-react';

const EventManagePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('tab') as 'photos' | 'details') || 'photos';
    const [activeTab, setActiveTab] = useState<'photos' | 'details'>(initialTab);

    useEffect(() => {
        if (location.hash === '#delete-section' && activeTab === 'details' && !loading) {
            // Small timeout to ensure rendering
            setTimeout(() => {
                const element = document.getElementById('delete-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location.hash, activeTab, loading]);
    const [uploading, setUploading] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        date: '',
        location: ''
    });

    useEffect(() => {
        if (id) {
            loadEventData(id);
        }
    }, [id]);

    const loadEventData = async (eventId: string) => {
        setLoading(true);
        try {
            const [eventData, photosData] = await Promise.all([
                BackendService.getEvent(eventId),
                BackendService.getEventPhotos(eventId)
            ]);

            if (eventData) {
                setEvent(eventData);
                setEditForm({
                    name: eventData.name,
                    date: eventData.date,
                    location: eventData.location
                });
                setPhotos(photosData);
            } else {
                navigate('/admin');
            }
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && id) {
            setUploading(true);
            try {
                await BackendService.uploadEventPhotos(id, Array.from(e.target.files));
                const newPhotos = Array.from(e.target.files).map((file, i) => ({
                    id: `new-${Date.now()}-${i}`,
                    url: URL.createObjectURL(file),
                    thumbnailUrl: URL.createObjectURL(file),
                    title: file.name,
                    date: new Date().toISOString(),
                    width: 800,
                    height: 600
                }));
                setPhotos(prev => [...newPhotos, ...prev]);
                alert('התמונות הועלו בהצלחה');
            } catch (error) {
                alert('שגיאה בהעלאת תמונות');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (window.confirm('האם למחוק תמונה זו?') && id) {
            try {
                await BackendService.deleteEventPhoto(id, photoId);
                setPhotos(prev => prev.filter(p => p.id !== photoId));
            } catch (error) {
                alert('שגיאה במחיקת תמונה');
            }
        }
    };

    const handleSetCover = async (photoUrl: string) => {
        if (id && event) {
            try {
                const updated = await BackendService.updateEvent(id, { coverImage: photoUrl });
                setEvent(updated);
                alert('תמונת קאבר עודכנה בהצלחה');
            } catch (error) {
                alert('שגיאה בעדכון תמונת קאבר');
            }
        }
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            try {
                const updated = await BackendService.updateEvent(id, editForm);
                setEvent(updated);
                alert('פרטי האירוע עודכנו בהצלחה');
            } catch (error) {
                alert('שגיאה בעדכון פרטים');
            }
        }
    };

    const handleDeleteEvent = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו תמחק את כל הנתונים והתמונות לצמיתות ולא ניתן יהיה לשחזר אותם.')) {
            if (id) {
                try {
                    await BackendService.deleteEvent(id);
                    navigate('/admin');
                } catch (error) {
                    alert('שגיאה במחיקת האירוע');
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

    return (
        <Layout>
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(`/gallery/${event.slug || event.id}`, '_blank')}
                                className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                                title="קישור לאורחים (זיהוי פנים)"
                            >
                                <Users className="w-4 h-4" />
                                <span>לאורחים</span>
                            </button>
                            <button
                                onClick={() => window.open(`/gallery/${event.coupleSlug || event.id}`, '_blank')}
                                className="px-4 py-2 text-sm font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors flex items-center gap-2 border border-cyan-100"
                                title="קישור לזוג (גלריה מלאה)"
                            >
                                <Heart className="w-4 h-4" />
                                <span>לזוג</span>
                            </button>

                        </div>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'photos' && (
                    <div className="space-y-8">
                        {/* Upload Section */}
                        <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center hover:bg-slate-50 hover:border-cyan-500 transition-all relative group cursor-pointer">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                                    <p className="text-slate-600 font-bold text-lg">מעלה תמונות...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-cyan-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">העלאת תמונות נוספות</h3>
                                    <p className="text-slate-500">גרור לכאן תמונות או לחץ לבחירה</p>
                                </>
                            )}
                        </div>

                        {/* Photos Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                                    כל התמונות ({photos.length})
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
                                                onClick={() => handleSetCover(photo.url)}
                                                className="p-3 bg-white/90 rounded-xl hover:bg-white text-amber-500 transition-colors shadow-lg transform hover:scale-105"
                                                title="קבע כתמונת קאבר"
                                            >
                                                <Star className="w-5 h-5 fill-current" />
                                            </button>
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
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    עריכת פרטי אירוע
                                </h2>
                            </div>
                            <form onSubmit={handleUpdateDetails} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">שם האירוע</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    {/* Cover Image Upload */}
                                    <div className="md:col-span-2 mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">תמונת קאבר</label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group bg-slate-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0] && id) {
                                                        try {
                                                            setUploading(true);
                                                            // 1. Upload the file
                                                            await BackendService.uploadEventPhotos(id, [e.target.files[0]]);

                                                            // 2. Refresh photos to get the new image ID
                                                            const updatedPhotos = await BackendService.getEventPhotos(id);
                                                            setPhotos(updatedPhotos);

                                                            // 3. Find the new photo (assuming it's the last one or by name)
                                                            // Ideally backend returns the uploaded image object.
                                                            // For now, let's find by filename match or just take the latest.
                                                            const uploadedPhoto = updatedPhotos.find(p => p.title === e.target.files![0].name);

                                                            if (uploadedPhoto) {
                                                                // 4. Set as cover
                                                                await BackendService.setCoverImage(id, uploadedPhoto.id);

                                                                // 5. Update local event state
                                                                setEvent(prev => prev ? ({ ...prev, coverImage: uploadedPhoto.url }) : null);
                                                                alert('תמונת קאבר עודכנה בהצלחה');
                                                            } else {
                                                                // Fallback: just refresh event to see if cover updated (if backend auto-sets it?)
                                                                // But we need to explicitly set it.
                                                                // If we can't find it, maybe just alert success of upload.
                                                                alert('התמונה הועלתה. אנא בחר אותה כתמונת קאבר מלשונית התמונות.');
                                                            }
                                                        } catch (error) {
                                                            console.error(error);
                                                            alert('שגיאה בהעלאת תמונת קאבר');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={uploading}
                                            />
                                            {event.coverImage ? (
                                                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                                    <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-white font-medium flex items-center gap-2">
                                                            <Upload className="w-5 h-5" />
                                                            <span>לחץ להחלפה</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-cyan-500 transition-colors shadow-sm">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-slate-600 font-medium">לחץ להעלאת תמונת קאבר</p>
                                                    <p className="text-slate-400 text-sm mt-1">או גרור תמונה לכאן</p>
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                                                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-slate-100">
                                    <button
                                        type="submit"
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>שמור שינויים</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div id="delete-section" className="mt-8 bg-red-50 rounded-3xl border border-red-100 p-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-red-900 font-bold text-lg mb-1">אזור מסוכן</h3>
                                    <p className="text-red-700 text-sm mb-6 max-w-lg">מחיקת האירוע היא פעולה בלתי הפיכה ותמחק את כל התמונות והנתונים הקשורים אליו. אנא וודא שאתה באמת רוצה לעשות זאת.</p>
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
        </Layout>
    );
};

export default EventManagePage;
