import React from 'react';
import { Calendar, MapPin, Camera, Heart, X } from 'lucide-react';

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
    if (!isOpen) return null;

    // Default placeholder if no image
    // Using a subtle pattern or color if null, but usually we just won't show the img tag or show a placeholder
    const coverImageSrc = data.coverImage || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="relative w-full max-w-5xl bg-[#FDFBF7] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* --- Mimicking GalleryPage Layout --- */}

                {/* Header (Simplified for Preview) */}
                {/* Header removed as per request */}
                <div className="w-full pt-8 pb-4">
                    {/* Spacer or minimal header if needed, currently empty/reduced */}
                </div>

                <div className="bg-[#FDFBF7] flex-grow w-full flex flex-col items-center py-12">
                    <div className="w-full max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E8DFD3]">
                            {/* Card Header (Event Details) */}
                            <div className="text-center py-8 px-6 border-b border-[#E8DFD3]">
                                <h2 className="text-3xl font-bold text-[#4A3B2C] mb-4">
                                    הגלריה שלך מהאירוע
                                </h2>

                                <div className="flex flex-wrap items-center justify-center gap-4 text-[#8B7355] text-lg font-medium max-w-2xl mx-auto">
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-4 h-4 text-[#C4A882]" />
                                        <span>{data.name || 'שם האירוע'}</span>
                                    </div>
                                    <span className="hidden md:inline w-px h-4 bg-[#E8DFD3]"></span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#C4A882]" />
                                        <span>{data.date ? new Date(data.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'תאריך'}</span>
                                    </div>
                                    <span className="hidden md:inline w-px h-4 bg-[#E8DFD3]"></span>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#C4A882]" />
                                        <span>{data.location || 'מיקום'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Split Layout */}
                            <div className="flex flex-col md:flex-row h-auto md:h-[500px]">

                                {/* Left Side (Desktop) / Bottom (Mobile) - Content & Action */}
                                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-[#FAF9F6] order-2 md:order-1">
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

                                {/* Right Side (Desktop) / Top (Mobile) - Cover Image */}
                                <div className="w-full md:w-1/2 h-64 md:h-full relative order-1 md:order-2 bg-slate-100">
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
    );
};

export default EventPreviewModal;
