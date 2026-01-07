import React from 'react';

interface EmailVerificationPendingProps {
    email: string;
    onResend: () => void;
    onBackToLogin: () => void;
    loading: boolean;
}

export const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({
    email,
    onResend,
    onBackToLogin,
    loading
}) => {
    return (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    אמת את כתובת האימייל שלך
                </h3>
                <p className="text-slate-600">
                    שלחנו אימייל אימות ל:
                </p>
                <p className="text-cyan-600 font-medium mt-1">
                    {email}
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-right">
                <p className="text-sm text-blue-800">
                    <strong>מה עכשיו?</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>בדוק את תיבת הדואר שלך</li>
                    <li>לחץ על הקישור באימייל</li>
                    <li>חזור לכאן והתחבר</li>
                </ol>
            </div>

            <button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-cyan-300 rounded-xl shadow-sm text-sm font-medium text-cyan-700 bg-white hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'שולח...' : 'שלח אימייל אימות מחדש'}
            </button>

            <div className="pt-4 border-t border-slate-200">
                <button
                    onClick={onBackToLogin}
                    className="text-sm text-cyan-600 hover:text-cyan-500 font-medium"
                >
                    כבר אימתת? לחץ כאן להתחברות
                </button>
            </div>
        </div>
    );
};
