import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { Event, Photo } from '../../types';
import {
    ArrowRight,
    Upload,
    Trash2,
    Star,
    Save,
    Loader2,
    Users,
    Heart
} from 'lucide-react';

const EventManagePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'photos' | 'details'>('photos');
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
        if (window.confirm('האם אתה בטוח שברצונך למחוק את האירוע לצמיתות? פעולה זו אינה הפיכה.')) {
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
        return <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>;
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ArrowRight className="w-5 h-5 text-stone-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-stone-900">{event.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className={`w-2 h-2 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {event.status === 'active' ? 'פעיל' : 'פג תוקף'}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.open(`/gallery/${event.id}`, '_blank')}
                            className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2"
                            title="קישור לאורחים (זיהוי פנים)"
                        >
                            <Users className="w-4 h-4" />
                            <span>לאורחים</span>
                        </button>
                        <button
                            onClick={() => window.open(`/gallery/${event.id}/full`, '_blank')}
                            className="px-4 py-2 text-sm font-medium text-stone-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-2"
                            title="קישור לזוג (גלריה מלאה)"
                        >
                            <Heart className="w-4 h-4 text-amber-600" />
                            <span>לזוג</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
                    <button
                        onClick={() => setActiveTab('photos')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'photos'
                            ? 'border-stone-900 text-stone-900'
                            : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        ניהול תמונות
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                            ? 'border-stone-900 text-stone-900'
                            : 'border-transparent text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        פרטי אירוע
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {activeTab === 'photos' && (
                    <div className="space-y-8">
                        {/* Upload Section */}
                        <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center hover:bg-stone-50 transition-colors relative group">
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
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                                    <p className="text-stone-600 font-medium">מעלה תמונות...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3 group-hover:text-amber-500 transition-colors" />
                                    <h3 className="text-lg font-bold text-stone-900">העלאת תמונות נוספות</h3>
                                    <p className="text-stone-500 text-sm mt-1">גרור לכאן או לחץ לבחירה</p>
                                </>
                            )}
                        </div>

                        {/* Photos Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-stone-900">כל התמונות ({photos.length})</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="group relative aspect-square bg-stone-100 rounded-xl overflow-hidden">
                                        <img
                                            src={photo.thumbnailUrl || photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleSetCover(photo.url)}
                                                className="p-2 bg-white/90 rounded-full hover:bg-white text-amber-500 transition-colors"
                                                title="קבע כתמונת קאבר"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="p-2 bg-white/90 rounded-full hover:bg-white text-red-500 transition-colors"
                                                title="מחק תמונה"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Cover Indicator */}
                                        {event.coverImage === photo.url && (
                                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
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
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="p-6 border-b border-stone-100">
                                <h2 className="text-lg font-bold text-stone-900">עריכת פרטי אירוע</h2>
                            </div>
                            <form onSubmit={handleUpdateDetails} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">שם האירוע</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">תאריך</label>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">מיקום</label>
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>שמור שינויים</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 bg-red-50 rounded-2xl border border-red-100 p-6">
                            <h3 className="text-red-800 font-bold mb-2">אזור מסוכן</h3>
                            <p className="text-red-600 text-sm mb-4">מחיקת האירוע היא פעולה בלתי הפיכה ותמחק את כל התמונות והנתונים הקשורים אליו.</p>
                            <button
                                onClick={handleDeleteEvent}
                                className="text-red-600 hover:text-red-700 font-medium text-sm border border-red-200 bg-white px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                מחק את האירוע לצמיתות
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EventManagePage;
