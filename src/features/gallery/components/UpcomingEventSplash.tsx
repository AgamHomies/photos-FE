import React, { useEffect, useState } from 'react';
import { Calendar, X, Camera, Heart } from 'lucide-react';

interface UpcomingEventSplashProps {
    photographerName?: string;
    onContinue: () => void;
    onLeadCapture: () => void;
}

/**
 * Popup shown DURING face scanning — gallery visible behind it.
 * Uses gallery's warm color palette.
 */
const UpcomingEventSplash: React.FC<UpcomingEventSplashProps> = ({
    photographerName,
    onContinue,
    onLeadCapture,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'rgba(240, 235, 227, 0.35)', backdropFilter: 'blur(5px)' }}
            onClick={onContinue}
        >
            {/* Popup card */}
            <div
                className={`relative w-full max-w-sm rounded-3xl p-6 text-center transition-all duration-500 ${visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}
                style={{
                    background: '#FDFBF7',
                    border: '1.5px solid #E8DFD3',
                    boxShadow: '0 20px 60px rgba(164, 135, 100, 0.25)',
                }}
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onContinue}
                    className="absolute top-4 left-4 p-1.5 rounded-full text-[#B39872] hover:bg-[#F0EBE3] transition-all"
                    aria-label="סגור"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #C4A882, #B39872)',
                                boxShadow: '0 4px 16px rgba(196, 168, 130, 0.4)',
                            }}
                        >
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                        <div
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: '#F0EBE3', border: '1.5px solid #E8DFD3' }}
                        >
                            <Heart className="w-3 h-3" style={{ color: '#C4A882' }} />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-xl font-black mb-1.5" style={{ color: '#4A3728' }}>
                    יש לכם אירוע בקרוב? 🎉
                </h2>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: '#8A7060' }}>
                    {photographerName
                        ? `רוצים ש${photographerName} יצלם אתכם שוב?`
                        : 'רוצים שהצלם יצלם אתכם באירוע הבא שלכם?'}
                    <br />
                    השאירו פרטים ונחזור אליכם!
                </p>

                {/* CTAs */}
                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={onLeadCapture}
                        className="w-full py-3 px-5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-105"
                        style={{
                            background: 'linear-gradient(135deg, #C4A882, #B39872)',
                            boxShadow: '0 4px 16px rgba(196, 168, 130, 0.5)',
                        }}
                    >
                        <Calendar className="w-4 h-4" />
                        כן! אני מעוניין/ת
                    </button>

                    <button
                        onClick={onContinue}
                        className="w-full py-2.5 px-5 rounded-2xl font-medium text-sm transition-colors hover:bg-[#F0EBE3]"
                        style={{ color: '#B39872' }}
                    >
                        לא, תודה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpcomingEventSplash;
