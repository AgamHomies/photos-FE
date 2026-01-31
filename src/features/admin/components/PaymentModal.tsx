import React from 'react';
import { X, CreditCard, Star, Award, Crown, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageType: 'basic' | 'premium' | 'gold';
    photoLimit: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, packageType, photoLimit }) => {
    if (!isOpen) return null;

    const packageInfo = {
        basic: {
            name: 'חבילת בסיס',
            icon: Star,
            color: 'cyan',
            features: [
                'עד 1,200 תמונות',
                'זיהוי פנים אוטומטי',
                'גלריה מותאמת אישית',
                'תמיכה טכנית'
            ]
        },
        premium: {
            name: 'חבילת פרימיום',
            icon: Award,
            color: 'purple',
            features: [
                'עד 10,000 תמונות',
                'זיהוי פנים אוטומטי',
                'גלריה מותאמת אישית',
                'תמיכה טכנית מועדפת',
                'אנליטיקס מתקדם'
            ]
        },
        gold: {
            name: 'חבילת זהב',
            icon: Crown,
            color: 'amber',
            features: [
                'ללא הגבלת תמונות',
                'זיהוי פנים אוטומטי',
                'גלריה מותאמת אישית',
                'תמיכה טכנית VIP',
                'אנליטיקס מתקדם',
                'עדיפות בעיבוד'
            ]
        }
    };

    const info = packageInfo[packageType];
    const Icon = info.icon;

    // Get the current URL for PayPal return
    const returnUrl = `${window.location.origin}/admin/create-event?payment=success&package=${packageType}`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={
                    packageType === 'basic'
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 relative'
                        : packageType === 'premium'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 p-6 relative'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 p-6 relative'
                }>
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
                        aria-label="סגור"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col items-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <Icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold">{info.name}</h2>
                        <p className="text-white/90 text-sm mt-1">השלם תשלום כדי ליצור את האירוע</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Package Features */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">מה כלול בחבילה:</h3>
                        <div className="space-y-3">
                            {info.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-medium">תשלום מאובטח דרך PayPal</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            לאחר השלמת התשלום תועבר אוטומטית ליצירת האירוע
                        </p>
                    </div>

                    {/* PayPal Button */}
                    {packageType === 'basic' ? (
                        <div className="flex flex-col items-center">
                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                                <input type="hidden" name="cmd" value="_s-xclick" />
                                <input type="hidden" name="hosted_button_id" value="LC59AUW59CVXE" />
                                <input type="hidden" name="currency_code" value="ILS" />
                                <input type="hidden" name="return" value={returnUrl} />
                                <input type="hidden" name="cancel_return" value={window.location.href} />
                                <input
                                    type="image"
                                    src="https://www.paypalobjects.com/he_IL/IL/i/btn/btn_paynowCC_LG.gif"
                                    name="submit"
                                    title="PayPal - The safer, easier way to pay online!"
                                    alt="Buy Now"
                                    className="hover:opacity-90 transition-opacity"
                                    style={{ border: 0 }}
                                />
                            </form>
                            <p className="text-xs text-slate-400 mt-3 text-center">
                                תועבר לדף התשלום המאובטח של PayPal
                            </p>
                        </div>
                    ) : packageType === 'premium' ? (
                        <div className="flex flex-col items-center">
                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                                <input type="hidden" name="cmd" value="_s-xclick" />
                                <input type="hidden" name="hosted_button_id" value="3TVN4J7HFD6ZY" />
                                <input type="hidden" name="currency_code" value="ILS" />
                                <input type="hidden" name="return" value={returnUrl} />
                                <input type="hidden" name="cancel_return" value={window.location.href} />
                                <input
                                    type="image"
                                    src="https://www.paypalobjects.com/he_IL/i/btn/btn_buynowCC_LG.gif"
                                    name="submit"
                                    title="PayPal - The safer, easier way to pay online!"
                                    alt="Buy Now"
                                    className="hover:opacity-90 transition-opacity"
                                    style={{ border: 0 }}
                                />
                            </form>
                            <p className="text-xs text-slate-400 mt-3 text-center">
                                תועבר לדף התשלום המאובטח של PayPal
                            </p>
                        </div>
                    ) : packageType === 'gold' ? (
                        <div className="flex flex-col items-center">
                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                                <input type="hidden" name="cmd" value="_s-xclick" />
                                <input type="hidden" name="hosted_button_id" value="9G3Q56NTP8THC" />
                                <input type="hidden" name="currency_code" value="ILS" />
                                <input type="hidden" name="return" value={returnUrl} />
                                <input type="hidden" name="cancel_return" value={window.location.href} />
                                <input
                                    type="image"
                                    src="https://www.paypalobjects.com/he_IL/i/btn/btn_buynowCC_LG.gif"
                                    name="submit"
                                    title="PayPal - The safer, easier way to pay online!"
                                    alt="Buy Now"
                                    className="hover:opacity-90 transition-opacity"
                                    style={{ border: 0 }}
                                />
                            </form>
                            <p className="text-xs text-slate-400 mt-3 text-center">
                                תועבר לדף התשלום המאובטח של PayPal
                            </p>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-8 py-4 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
