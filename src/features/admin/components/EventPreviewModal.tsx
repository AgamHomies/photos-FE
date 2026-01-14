import React from 'react';
import { Calendar, MapPin, Camera, Heart, X, Monitor, Smartphone, Image as ImageIcon } from 'lucide-react';
import { getThemeByColor } from '../../../utils/galleryThemes';

interface EventPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        name: string;
        date: string;
        location: string;
        coverImage: string | null;
        photographerName?: string;
        photographerImage?: string;
        backgroundColor?: string;
    };
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ isOpen, onClose, data }) => {
    const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

    // Get theme based on background color to get the accent color
    const theme = getThemeByColor(data.backgroundColor || '#FDFBF7');

    // Handle ESC key to close modal
    React.useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            // Save current overflow value
            const originalOverflow = document.body.style.overflow;
            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            return () => {
                // Restore original overflow when modal closes
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Default placeholder if no image
    const coverImageSrc = data.coverImage || '';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-preview-title"
            onClick={onClose}
        >
            <div
                className={`relative w-full rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${viewMode === 'mobile' ? 'max-w-[400px] h-[85vh]' : 'max-w-5xl max-h-[90vh]'}`}
                style={{ backgroundColor: data.backgroundColor || '#FDFBF7' }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Modal Controls (Close & View Toggle) */}
                <div className="absolute top-4 left-4 z-50 flex items-center gap-2" role="toolbar" aria-label="תצוגת תצוגה מקדימה">
                    <div className="bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm flex items-center">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'desktop' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="תצוגת מחשב"
                            aria-label="תצוגת מחשב"
                            aria-pressed={viewMode === 'desktop'}
                        >
                            <Monitor className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'mobile' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="תצוגת נייד"
                            aria-label="תצוגת נייד"
                            aria-pressed={viewMode === 'mobile'}
                        >
                            <Smartphone className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-600"
                    aria-label="סגור תצוגה מקדימה"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex-grow overflow-y-auto">
                    {/* Photographer Header Preview */}
                    <div
                        className="w-full pt-12 pb-8 text-center transition-all duration-300"
                        style={{ backgroundColor: theme.headerBackground }}
                    >
                        <div className="mb-4">
                            {data.photographerImage ? (
                                <img
                                    src={data.photographerImage}
                                    alt="Logo"
                                    className="w-20 h-20 mx-auto object-contain bg-transparent"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`${data.photographerImage ? 'hidden' : ''} w-20 h-20 mx-auto flex items-center justify-center text-slate-400`}>
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                            {data.photographerName || 'שם הצלם'}
                        </h1>
                        <p className="text-sm tracking-[0.2em] uppercase opacity-70 mb-4" style={{ color: theme.textSecondary }}>
                            PHOTOGRAPHY STUDIO
                        </p>
                    </div>

                    <div className="flex-grow w-full flex flex-col items-center pb-12">
                        <div className={`w-full mx-auto px-4 transition-all duration-300 mt-8 ${viewMode === 'mobile' ? 'max-w-full' : 'max-w-[1600px]'}`}>
                            <div
                                className="rounded-3xl shadow-xl overflow-hidden border transition-all duration-300"
                                style={{
                                    backgroundColor: theme.cardBackground,
                                    borderColor: theme.cardBorder
                                }}
                            >

                                {/* Card Header (Event Details) */}
                                <div
                                    className="text-center py-10 px-6 border-b"
                                    style={{ borderColor: theme.cardBorder }}
                                >
                                    <h2
                                        id="event-preview-title"
                                        className={`font-bold mb-4 transition-all duration-300 ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}
                                        style={{ color: theme.textPrimary }}
                                    >
                                        הגלריה שלך מהאירוע
                                    </h2>

                                    <div className="flex flex-wrap items-center justify-center gap-6 text-lg font-medium max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-5 h-5" style={{ color: theme.accentColor }} />
                                            <span>{data.name || 'שם האירוע'}</span>
                                        </div>
                                        <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'} w-px h-5`} style={{ backgroundColor: theme.cardBorder }}></span>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" style={{ color: theme.accentColor }} />
                                            <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'תאריך'}</span>
                                        </div>
                                        <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'} w-px h-5`} style={{ backgroundColor: theme.cardBorder }}></span>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" style={{ color: theme.accentColor }} />
                                            <span>{data.location || 'מיקום'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Split Layout */}
                                <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row h-[600px]'}`}>

                                    {/* Content Side */}
                                    <div
                                        className={`flex flex-col justify-center items-center text-center ${viewMode === 'mobile' ? 'w-full order-2 p-8' : 'w-1/2 order-1 p-12'}`}
                                        style={{ backgroundColor: theme.backgroundColor }}
                                    >
                                        <div
                                            className="w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-sm transition-transform hover:scale-105"
                                            style={{ backgroundColor: `${theme.accentColor}15` }}
                                        >
                                            <Camera className="w-10 h-10 transition-colors" style={{ color: theme.accentColor }} />
                                        </div>

                                        <h3 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>מצאו את התמונות שלכם מהאירוע</h3>

                                        <p className="mb-10 max-w-sm leading-relaxed text-base" style={{ color: theme.textSecondary }}>
                                            השתמשו בטכנולוגיית זיהוי הפנים המהפכנית שלנו כדי למצוא את כל התמונות שלכם בשניות
                                        </p>

                                        <div
                                            className="px-10 py-4 rounded-full font-bold shadow-lg transition-all hover:scale-105 cursor-default flex items-center gap-3"
                                            style={{
                                                backgroundColor: theme.accentColor,
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            <Camera className="w-6 h-6" />
                                            <span>העלה סלפי (דמו)</span>
                                        </div>
                                    </div>

                                    {/* Cover Image Side */}
                                    <div className={`
                                        relative
                                        ${viewMode === 'mobile' ? 'w-full aspect-[3/2] order-1' : 'w-1/2 h-full order-2'}
                                    `} style={{ backgroundColor: theme.cardBorder }}>
                                        {coverImageSrc ? (
                                            <img
                                                src={coverImageSrc}
                                                alt={`תמונת כיסוי לאירוע ${data.name}`}
                                                className="w-full h-full object-cover shadow-inner"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                אין תמונה
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPreviewModal;
