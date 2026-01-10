import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('אנא הזן כתובת אימייל');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'אירעה שגיאה. אנא נסה שנית.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setSuccess(false);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative" dir="rtl">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {success ? (
                    /* Success State */
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            נשלח בהצלחה!
                        </h3>
                        <p className="text-slate-600 mb-6">
                            אם קיים חשבון עם כתובת האימייל הזו, שלחנו אליך קישור לאיפוס סיסמה.
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 px-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
                        >
                            סגור
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                            שכחת סיסמה?
                        </h3>
                        <p className="text-slate-600 mb-6">
                            הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1">
                                    אימייל
                                </label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="block w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50"
                                    disabled={loading}
                                />
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                    disabled={loading}
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'שולח...' : 'שלח קישור'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
