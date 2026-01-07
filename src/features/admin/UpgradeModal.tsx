import React, { useState } from 'react';
import { X, Check, CreditCard, Star, Zap } from 'lucide-react';
import { BackendService } from '../../services/backendService';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentLimit: number;
    usage: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess, currentLimit, usage }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePurchase = async (packageId: string) => {
        setLoading(packageId);
        setError(null);
        try {
            const success = await BackendService.mockPay(packageId);
            if (success) {
                onSuccess();
                onClose();
            } else {
                setError('Payment failed. Please try again.');
            }
        } catch (err) {
            console.error('Purchase failed', err);
            setError('An error occurred during purchase.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-5"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">שדרג את החשבון שלך</h2>
                        <p className="text-slate-300 text-sm">בצע רכישה נוספת כדי להמשיך ליצור אירועים.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4">
                        {/* Package 1 - Basic */}
                        <button
                            onClick={() => handlePurchase('basic')}
                            disabled={!!loading}
                            className="group relative border border-slate-200 hover:border-cyan-500 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-cyan-500/10 text-right w-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-2xl font-bold bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                    ₪199
                                </span>
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-cyan-600 transition-colors">חבילת בסיס</h3>
                                    <p className="text-slate-500 text-sm mt-1">מתאים לאירועים קטנים</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>עד 1,200 תמונות</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>קישור פעיל לחודש אחד</span>
                                </div>
                            </div>
                            {loading === 'basic' && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        {/* Package 2 - Premium (Recommended) */}
                        <button
                            onClick={() => handlePurchase('premium')}
                            disabled={!!loading}
                            className="group relative border-2 border-cyan-500 rounded-2xl p-5 transition-all shadow-lg shadow-cyan-500/10 text-right w-full bg-cyan-50/10"
                        >
                            <div className="absolute -top-3 right-4 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                הבחירה המובילה
                            </div>

                            <div className="flex justify-between items-start mb-3 mt-1">
                                <span className="text-2xl font-bold bg-cyan-100 text-cyan-700 px-4 py-1.5 rounded-full">
                                    ₪279
                                </span>
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-cyan-600 transition-colors">חבילת פרימיום</h3>
                                    <p className="text-slate-500 text-sm mt-1">לרוב האירועים</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-700 font-medium">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>עד 10,000 תמונות</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>קישור פעיל לחודשיים</span>
                                </div>
                            </div>
                            {loading === 'premium' && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        {/* Package 3 - Gold */}
                        <button
                            onClick={() => handlePurchase('gold')}
                            disabled={!!loading}
                            className="group relative border border-slate-200 hover:border-cyan-500 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-cyan-500/10 text-right w-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-2xl font-bold bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                    ₪529
                                </span>
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-cyan-600 transition-colors">חבילת זהב</h3>
                                    <p className="text-slate-500 text-sm mt-1">לאירועי ענק</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>ללא הגבלת תמונות</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-cyan-500" />
                                    <span>קישור פעיל לחודשיים</span>
                                </div>
                            </div>
                            {loading === 'gold' && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                        <CreditCard className="w-3 h-3" />
                        <span>תשלום מאובטח באמצעות MockPay</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
