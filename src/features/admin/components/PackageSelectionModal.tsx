import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Star, Award, Crown, Sparkles } from 'lucide-react';

interface PackageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PackageSelectionModal: React.FC<PackageSelectionModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<'basic' | 'premium' | 'gold' | null>(null);

    const isIndividual = (localStorage.getItem('active_mode') ?? 'photographer') === 'individual';

    const PRICES = isIndividual
        ? { basic: '49', premium: '79', gold: '169' }
        : { basic: '79', premium: '139', gold: '269' };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePackageSelect = async (packageType: 'basic' | 'premium' | 'gold') => {
        setLoading(packageType);
        setSelectedPackage(packageType);

        // Navigate directly to create event
        navigate('/admin/create-event', { state: { packageType } });

        setLoading(null);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full relative border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 text-slate-900 p-4 pb-6 relative overflow-hidden text-center border-b border-slate-100">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-full z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                            בחירת חבילה
                        </h2>
                        <p className="text-slate-500 text-base font-medium">
                            התאם את החבילה המושלמת לגודל האירוע שלך
                        </p>
                    </div>
                </div>

                {/* Content - 3 Columns */}
                <div className="p-4 md:p-6 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center max-w-4xl mx-auto">

                        {/* Basic Package */}
                        <button
                            onClick={() => handlePackageSelect('basic')}
                            disabled={!!loading}
                            className="group relative h-full bg-white border border-slate-200 rounded-3xl p-4 transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 text-right flex flex-col items-center"
                        >
                            <div className="mb-3 p-2.5 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                                <Star className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-0.5">חבילת בסיס</h3>
                            <div className="text-2xl font-black text-slate-900 mb-1">₪{PRICES.basic}</div>
                            <p className="text-slate-500 text-xs font-medium mb-3 text-center">אירועים קטנים וימי הולדת</p>

                            <div className="w-full space-y-1.5 text-sm text-slate-600 mb-4 flex-1">
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span>עד <span className="font-bold text-slate-900">1,200</span> תמונות</span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span>קישור פעיל לחודש</span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span>זיהוי פנים חכם</span>
                                </div>
                            </div>

                            <div className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800 transition-all text-center text-sm">
                                בחר בסיס
                            </div>
                        </button>

                        {/* Premium Package - Recommended (Center) */}
                        <button
                            onClick={() => handlePackageSelect('premium')}
                            disabled={!!loading}
                            className="group relative h-full bg-white border-2 border-cyan-500 rounded-3xl p-5 shadow-2xl shadow-cyan-900/10 transform md:-translate-y-2 transition-all hover:shadow-cyan-900/20 text-right flex flex-col items-center z-10"
                        >
                            {/* Elegant Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                                <Sparkles className="w-3 h-3" />
                                <span>מומלץ ביותר</span>
                            </div>

                            <div className="mb-3 p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-0.5">חבילת פרימיום</h3>
                            <div className="text-3xl font-black text-slate-900 mb-1">₪{PRICES.premium}</div>
                            <p className="text-cyan-600 text-xs font-medium mb-3 text-center bg-cyan-50 px-3 py-0.5 rounded-full">הבחירה המשתלמת ביותר</p>

                            <div className="w-full space-y-2 text-sm text-slate-700 mb-5 flex-1 px-1">
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    <span className="text-sm font-medium">עד <span className="font-bold text-slate-900">10,000</span> תמונות</span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    <span className="text-sm">קישור פעיל לחודשיים</span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    <span className="text-sm">זיהוי פנים חכם</span>
                                </div>
                                <div className="flex items-center gap-2 w-full bg-cyan-50/50 p-1.5 rounded-lg -mr-1.5">
                                    <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    <span className="text-sm font-bold text-cyan-800">מתאים במיוחד לחתונות 💍</span>
                                </div>
                            </div>

                            <div className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20 group-hover:bg-cyan-500 group-hover:shadow-cyan-500/30 transition-all text-center transform group-hover:-translate-y-1">
                                בחר בחבילה זו
                            </div>
                        </button>

                        {/* Gold Package */}
                        <button
                            onClick={() => handlePackageSelect('gold')}
                            disabled={!!loading}
                            className="group relative h-full bg-white border border-slate-200 rounded-3xl p-4 transition-all hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 text-right flex flex-col items-center"
                        >
                            <div className="mb-3 p-2.5 bg-slate-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                                <Crown className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-0.5">חבילת זהב</h3>
                            <div className="text-2xl font-black text-slate-900 mb-1">₪{PRICES.gold}</div>
                            <p className="text-slate-500 text-xs font-medium mb-3 text-center">אירועי ענק ופסטיבלים</p>

                            <div className="w-full space-y-1.5 text-sm text-slate-600 mb-4 flex-1">
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span><span className="font-bold text-slate-900">ללא הגבלת תמונות</span></span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span>קישור פעיל לחודשיים</span>
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3 h-3" /></div>
                                    <span>זיהוי פנים חכם</span>
                                </div>
                            </div>

                            <div className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-200 transition-all text-center text-sm">
                                בחר זהב
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageSelectionModal;
