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
        layout?: string;
    };
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ isOpen, onClose, data }) => {
    const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

    // Get theme based on background color to get the accent color
    const theme = getThemeByColor(data.backgroundColor || '#F8FAFC');
    const layout = data.layout === 'ai' ? 'split' : (data.layout || 'split');

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

                                {(() => {
                                    const layout = data.layout || theme.layout || 'split';

                                    const LandingPanelContent = () => (
                                        <div className={`flex flex-col justify-center items-center text-center transition-all duration-300 w-full ${layout === 'split' || layout === 'portrait' ? (viewMode === 'mobile' ? 'p-8' : 'w-1/2 p-12') : 'p-12 md:p-16'}`} style={{ backgroundColor: layout === 'glass' ? 'transparent' : theme.backgroundColor }}>
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
                                    );

                                    const EventDetailsContent = () => (
                                        <div
                                            className={`text-center py-10 px-6 ${layout === 'hero' ? 'border-none' : 'border-b'}`}
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
                                    );

                                    const CoverImageContent = ({ className = "" }) => (
                                        <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: theme.cardBorder }}>
                                            {coverImageSrc ? (
                                                <img
                                                    src={coverImageSrc}
                                                    alt={`תמונת כיסוי לאירוע ${data.name}`}
                                                    className="w-full h-full object-cover shadow-inner"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                    );

                                    if (layout === 'split') {
                                        return (
                                            <>
                                                <EventDetailsContent />
                                                <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row h-[500px]'}`}>
                                                    <LandingPanelContent />
                                                    <CoverImageContent className={`${viewMode === 'mobile' ? 'w-full aspect-[3/2] order-1' : 'w-1/2 h-full order-2'}`} />
                                                </div>
                                            </>
                                        );
                                    }

                                    if (layout === 'hero') {
                                        return (
                                            <div className="flex flex-col">
                                                <CoverImageContent className="w-full h-64 md:h-80" />
                                                <EventDetailsContent />
                                                <LandingPanelContent />
                                            </div>
                                        );
                                    }

                                    if (layout === 'portrait') {
                                        return (
                                            <>
                                                <EventDetailsContent />
                                                <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row h-[600px]'}`}>
                                                    <CoverImageContent className={`${viewMode === 'mobile' ? 'w-full aspect-[2/3] order-1' : 'w-2/5 h-full order-2'}`} />
                                                    <LandingPanelContent />
                                                </div>
                                            </>
                                        );
                                    }

                                    if (layout === 'glass') {
                                        return (
                                            <div className="relative min-h-[600px] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                                                <div className="absolute inset-0 z-0">
                                                    <img src={coverImageSrc || ''} className="w-full h-full object-cover blur-md scale-110 opacity-40" />
                                                    <div className="absolute inset-0" style={{ backgroundColor: `${theme.backgroundColor}66` }}></div>
                                                </div>
                                                <div className="relative z-10 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-2xl max-w-2xl w-full">
                                                    <EventDetailsContent />
                                                    <LandingPanelContent />
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (layout === 'minimal') {
                                        return (
                                            <div className="py-12 flex flex-col items-center">
                                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-8 border-4 border-white shadow-xl overflow-hidden relative">
                                                    <img src={coverImageSrc || ''} className="w-full h-full object-cover" />
                                                </div>
                                                <EventDetailsContent />
                                                <div className="max-w-xl w-full">
                                                    <LandingPanelContent />
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (layout === 'magazine') {
                                        return (
                                            <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row min-h-[600px]'}`}>
                                                <div className={`p-8 md:p-12 flex flex-col justify-center ${viewMode === 'mobile' ? 'w-full order-2' : 'w-1/2 order-1'}`}>
                                                    <div className="border-r-4 pr-6 mb-8" style={{ borderColor: theme.accentColor }}>
                                                        <EventDetailsContent />
                                                    </div>
                                                    <LandingPanelContent />
                                                </div>
                                                <div className={`relative ${viewMode === 'mobile' ? 'w-full h-80 order-1' : 'w-1/2 min-h-[400px] order-2'}`}>
                                                    <div className="absolute inset-4 md:inset-12 z-10 shadow-2xl overflow-hidden rounded-lg">
                                                        <img src={coverImageSrc || ''} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-20" style={{ backgroundColor: theme.accentColor }}></div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (layout === 'full-screen') {
                                        return (
                                            <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
                                                <div className="absolute inset-0 z-0">
                                                    {coverImageSrc && <img src={coverImageSrc} className="w-full h-full object-cover" />}
                                                    <div className="absolute inset-0 bg-black/30"></div>
                                                </div>
                                                <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 md:p-16 rounded-[40px] border border-white/20 shadow-2xl text-white max-w-3xl mx-4 text-center">
                                                    <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">{data.name || 'שם האירוע'}</h2>
                                                    <div className="flex flex-col gap-4 mb-12 text-xl font-medium">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <Calendar className="w-6 h-6" />
                                                            <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL') : 'תאריך'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-3">
                                                            <MapPin className="w-6 h-6" />
                                                            <span>{data.location || 'מיקום'}</span>
                                                        </div>
                                                    </div>
                                                    <LandingPanelContent />
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (layout === 'side-by-side') {
                                        return (
                                            <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row min-h-[600px] gap-8 p-8'}`}>
                                                <div className={`${viewMode === 'mobile' ? 'w-full px-4 pt-12' : 'w-2/5 flex flex-col justify-center'}`}>
                                                    <div className="mb-12">
                                                        <span className="text-sm font-bold uppercase tracking-widest opacity-50 block mb-2" style={{ color: theme.textSecondary }}>הגלריה הרשמית</span>
                                                        <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: theme.textPrimary }}>{data.name || 'שם האירוע'}</h2>
                                                        <div className="space-y-4" style={{ color: theme.textSecondary }}>
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="w-5 h-5" style={{ color: theme.accentColor }} />
                                                                <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL') : 'תאריך'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <MapPin className="w-5 h-5" style={{ color: theme.accentColor }} />
                                                                <span>{data.location || 'מיקום'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <LandingPanelContent />
                                                </div>
                                                <div className={`${viewMode === 'mobile' ? 'w-full h-96 mt-12' : 'w-3/5 min-h-[500px]'} relative group`}>
                                                    <div className="absolute inset-0 bg-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                                                        {coverImageSrc && <img src={coverImageSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                                                    </div>
                                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl border-8 border-white shadow-xl z-20 overflow-hidden hidden md:block" style={{ backgroundColor: theme.backgroundColor }}>
                                                        {coverImageSrc && <img src={coverImageSrc} className="w-full h-full object-cover opacity-50" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (layout === 'stack') {
                                        return (
                                            <div className="flex flex-col items-center py-16 px-4">
                                                <div className="relative max-w-2xl w-full mb-16">
                                                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-0">
                                                        {coverImageSrc && <img src={coverImageSrc} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="absolute -bottom-10 -right-4 md:-right-12 z-10 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-lg border border-slate-100">
                                                        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight" style={{ color: theme.textPrimary }}>{data.name || 'שם האירוע'}</h2>
                                                        <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL') : 'תאריך'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{data.location || 'מיקום'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-12 max-w-md w-full">
                                                    <LandingPanelContent />
                                                </div>
                                            </div>
                                        );
                                    }


                                    return null;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPreviewModal;
