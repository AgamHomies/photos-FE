import React, { useState } from 'react';
import { X, CheckCircle, Loader } from 'lucide-react';
import { BackendService } from '../../../services/backendService';

export interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    slug: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
    isOpen,
    onClose,
    slug
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [phoneError, setPhoneError] = useState('');

    if (!isOpen) return null;

    const validatePhone = (val: string) => {
        const digitsOnly = /^\d+$/;
        if (!val.trim()) return 'נא להכניס מספר טלפון';
        if (!digitsOnly.test(val.trim())) return 'מספר טלפון יכול להכיל ספרות בלבד';
        if (val.trim().length < 9) return 'מספר טלפון קצר מדי';
        return '';
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPhone(val);
        if (phoneError) setPhoneError(validatePhone(val));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!name.trim()) {
            setErrorMsg('נא למלא את השם');
            return;
        }

        const pErr = validatePhone(phone);
        if (pErr) {
            setPhoneError(pErr);
            return;
        }
        setPhoneError('');

        setIsSubmitting(true);
        try {
            const result = await BackendService.submitGuestLead(slug, name, phone.trim());
            if (result.success) {
                setHasSubmitted(true);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setErrorMsg('אירעה שגיאה. אנא נסו שוב מאוחר יותר.');
            }
        } catch (err) {
            setErrorMsg('שגיאת תקשורת עם השרת.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4A3B2C]/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-[#FAF9F6] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-[#D4C4B0]/50" dir="rtl">
                <div className="flex items-center justify-between p-5 border-b border-[#D4C4B0]/30 bg-white">
                    <h3 className="text-xl font-bold text-[#4A3B2C]">יש לכם אירוע בקרוב?</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-[#8B7355] hover:text-[#4A3B2C] rounded-full hover:bg-[#EEE9E1] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {hasSubmitted ? (
                        <div className="flex flex-col items-center justify-center text-center py-6 animate-in slide-in-from-bottom-2">
                            <CheckCircle className="w-16 h-16 text-[#C4A882] mb-4" />
                            <h4 className="text-2xl font-bold text-[#4A3B2C] mb-2">תודה רבה!</h4>
                            <p className="text-[#8B7355]">
                                הפרטים נשמרו בהצלחה. נחזור אליכם בהקדם!
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-[#8B7355] text-sm mb-4">
                                נשמח להיות חלק גם מהאירוע המיוחד שלכם. השאירו פרטים ונחזור אליכם בהקדם.
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-[#4A3B2C] mb-1">
                                    שם מלא
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ישראל ישראלי"
                                    className="w-full px-4 py-2 bg-white border border-[#D4C4B0] rounded focus:ring-1 focus:ring-[#C4A882] focus:border-[#C4A882] outline-none transition-all placeholder:text-gray-400"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#4A3B2C] mb-1">
                                    טלפון נייד
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onBlur={() => setPhoneError(validatePhone(phone))}
                                    placeholder="0501234567"
                                    dir="ltr"
                                    className={`w-full px-4 py-2 bg-white border rounded focus:ring-1 outline-none transition-all text-right placeholder:text-gray-400 ${phoneError
                                            ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                                            : 'border-[#D4C4B0] focus:ring-[#C4A882] focus:border-[#C4A882]'
                                        }`}
                                    disabled={isSubmitting}
                                />
                                {phoneError && (
                                    <p className="text-red-500 text-xs mt-1 font-medium animate-in slide-in-from-top-1">
                                        {phoneError}
                                    </p>
                                )}
                            </div>

                            {errorMsg && (
                                <p className="text-red-500 text-sm text-center font-bold animate-in slide-in-from-top-1">
                                    {errorMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#C4A882] text-white hover:bg-[#B39872] active:translate-y-0.5 transition-all py-3 rounded font-bold shadow-md disabled:opacity-70 disabled:active:translate-y-0 flex items-center justify-center mt-6"
                            >
                                {isSubmitting ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    'שלח פרטים'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
