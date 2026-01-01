import React from 'react';
import { Calendar, MapPin, Camera, Heart, X, Monitor, Smartphone } from 'lucide-react';

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
    };
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ isOpen, onClose, data }) => {
    const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

    if (!isOpen) return null;

    // Default placeholder if no image
    const coverImageSrc = data.coverImage || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className={`relative w-full bg-[#FDFBF7] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${viewMode === 'mobile' ? 'max-w-[400px] h-[85vh]' : 'max-w-5xl max-h-[90vh]'}`}>

                {/* Modal Controls (Close & View Toggle) */}
                <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                    <div className="bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm flex items-center">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'desktop' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="תצוגת מחשב"
                        >
                            <Monitor className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'mobile' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="תצוגת נייד"
                        >
                            <Smartphone className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex-grow overflow-y-auto">
                    {/* Header removed as per request */}
                    <div className="w-full pt-8 pb-4"></div>

                    <div className="flex-grow w-full flex flex-col items-center pb-12">
                        <div className={`w-full mx-auto px-4 transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-full' : 'max-w-4xl'}`}>
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E8DFD3]">

                                {/* Card Header (Event Details) */}
                                <div className="text-center py-8 px-6 border-b border-[#E8DFD3]">
                                    <h2 className={`font-bold text-[#4A3B2C] mb-4 ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                                        הגלריה שלך מהאירוע
                                    </h2>

                                    <div className="flex flex-wrap items-center justify-center gap-4 text-[#8B7355] text-lg font-medium max-w-2xl mx-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="w-4 h-4 text-[#C4A882]" />
                                            <span>{data.name || 'שם האירוע'}</span>
                                        </div>
                                        <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'} w-px h-4 bg-[#E8DFD3]`}></span>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#C4A882]" />
                                            <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'תאריך'}</span>
                                        </div>
                                        <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'} w-px h-4 bg-[#E8DFD3]`}></span>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#C4A882]" />
                                            <span>{data.location || 'מיקום'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Split Layout - Conditional Rendering based on viewMode */}
                                <div className={`flex ${viewMode === 'mobile' ? 'flex-col' : 'flex-row h-[500px]'}`}>

                                    {/* Content Side */}
                                    <div className={`
                                        flex flex-col justify-center items-center text-center bg-[#FAF9F6]
                                        ${viewMode === 'mobile' ? 'w-full order-2 p-8' : 'w-1/2 order-1 p-12'}
                                    `}>
                                        <div className="w-16 h-16 bg-[#F0EBE3] rounded-full flex items-center justify-center mb-6">
                                            <Camera className="w-8 h-8 text-[#C4A882]" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-[#4A3B2C] mb-3">מצאו את התמונות שלכם מהאירוע</h3>

                                        <p className="text-[#8B7355] mb-8 max-w-sm leading-relaxed text-sm">
                                            העלו סלפי ברור של עצמכם — והמערכת שלנו תזהה אוטומטית ותציג לכם רק את התמונות המדהימות שבהן הופעתם באירוע.
                                        </p>

                                        <div className="bg-[#C4A882] text-white px-8 py-4 rounded-full font-bold shadow-md flex items-center gap-3 w-full max-w-xs justify-center opacity-80 cursor-not-allowed">
                                            <Camera className="w-5 h-5" />
                                            <span>העלה סלפי (דמו)</span>
                                        </div>
                                    </div>

                                    {/* Cover Image Side */}
                                    <div className={`
                                        relative bg-slate-100
                                        ${viewMode === 'mobile' ? 'w-full aspect-[3/2] order-1' : 'w-1/2 h-full order-2'}
                                    `}>
                                        {coverImageSrc ? (
                                            <img
                                                src={coverImageSrc}
                                                alt="Cover"
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
