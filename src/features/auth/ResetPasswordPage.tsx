import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import Layout from '../../components/Layout';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('סיסמה חייבת להכיל לפחות 8 תווים');
            return;
        }

        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabaseAuthService.updatePassword(password);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            }
        } catch (err: any) {
            setError('אירעה שגיאה. אנא נסה שנית.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <Layout showFooter={false}>
                <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
                        <div className="mx-auto h-20 w-20 bg-cyan-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <div className="bg-cyan-500 p-4 rounded-full shadow-lg shadow-cyan-500/30">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            הסיסמה אופסה בהצלחה!
                        </h2>
                        <p className="text-slate-500 mb-8">
                            הסיסמה החדשה שלך נשמרה. עכשיו ניתן להתחבר ולהמשיך להשתמש במערכת.
                        </p>
                        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm mb-8 flex items-center gap-2 justify-center">
                            <span>מומלץ לשמור את הסיסמה החדשה במקום בטוח</span>
                        </div>
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full py-3.5 px-4 rounded-xl text-white bg-cyan-500 hover:bg-cyan-600 font-bold shadow-lg hover:shadow-cyan-500/30 transition-all"
                        >
                            עבור למסך ההתחברות
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                            <Lock className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            איפוס סיסמה
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            נא ליצור סיסמה חדשה כדי להשלים את תהליך האיפוס.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה חדשה</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="block w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">לפחות 8 תווים</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">אימות סיסמה</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="block w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-200 hover:bg-cyan-500 hover:text-white text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'מאפס...' : 'אפס סיסמה'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/auth')}
                                className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
                            >
                                נזכרת בסיסמה? התחבר כאן
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ResetPasswordPage;
