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
                        {/* Package 1 */}
                        <button
                            onClick={() => handlePurchase('1_event')}
                            disabled={!!loading}
                            className="group relative border border-slate-200 hover:border-cyan-500 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-cyan-500/10 text-right w-full"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                    ₪10
                                </span>
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-cyan-600 transition-colors">אירוע אחד נוסף</h3>
                                    <p className="text-slate-500 text-sm">הוספת אירוע בודד לחבילה שלך</p>
                                </div>
                            </div>
                            {loading === '1_event' && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        {/* Package 2 - Recommended */}
                        <button
                            onClick={() => handlePurchase('5_events')}
                            disabled={!!loading}
                            className="group relative border-2 border-cyan-500 rounded-2xl p-4 transition-all shadow-lg shadow-cyan-500/10 text-right w-full bg-cyan-50/10"
                        >
                            <div className="absolute -top-3 right-4 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                מומלץ
                            </div>

                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm font-bold bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
                                    ₪40
                                </span>
                                <div className="text-right">
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-cyan-600 transition-colors">חבילת 5 אירועים</h3>
                                    <p className="text-slate-500 text-sm">הוספת 5 אירועים (חסוך 20%)</p>
                                </div>
                            </div>
                            {loading === '5_events' && (
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
