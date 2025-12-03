import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { PhotographerRegistration } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { BackendService } from '../../services/backendService';
import { supabaseAuthService } from '../../services/supabaseAuthService';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Check if we came from a registration button
    const initialMode = (location.state as any)?.mode === 'register' ? false : true;
    const [isLogin, setIsLogin] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<PhotographerRegistration>({
        email: '',
        password: '',
        fullName: '',
        description: '',
        address: '',
        phone: '',
        logo: null,
        portfolio: [],
        instagramUrl: '',
        tiktokUrl: '',
        facebookUrl: '',
        termsAccepted: false
    });
    const [errors, setErrors] = useState<Partial<Record<keyof PhotographerRegistration, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Check for OAuth callback
    useEffect(() => {
        let hasRun = false;

        const handleOAuthCallback = async () => {
            if (hasRun) return;
            hasRun = true;

            const { session, error } = await supabaseAuthService.getSession();

            if (error || !session) return;

            // Check if this is from an OAuth callback
            const hasHash = window.location.hash.includes('access_token');
            if (!hasHash) return;

            const user = session.user;

            try {
                await BackendService.getProfile();
                navigate('/admin');
            } catch (err) {
                try {
                    await BackendService.register({
                        email: user.email || '',
                        password: '',
                        fullName: '',
                        description: '',
                        address: '',
                        phone: '',
                        termsAccepted: true,
                        logo: null,
                        portfolio: [],
                        instagramUrl: '',
                        tiktokUrl: '',
                        facebookUrl: ''
                    });
                    navigate('/complete-profile');
                } catch (registerErr) {
                    console.error('Failed to register user:', registerErr);
                    alert('שגיאה ביצירת חשבון. אנא נסה שנית.');
                }
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof PhotographerRegistration]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { error } = await supabaseAuthService.signInWithGoogle();
            if (error) alert('שגיאה בהתחברות עם Google: ' + error.message);
        } catch (error: any) {
            console.error('Google sign in error:', error);
            alert('שגיאה בהתחברות עם Google');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof PhotographerRegistration, string>> = {};
        if (!formData.email) newErrors.email = 'אימייל הוא שדה חובה';
        if (!formData.password) {
            newErrors.password = 'סיסמה היא שדה חובה';
        } else if (formData.password.length < 8) {
            newErrors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
        }

        if (!isLogin) {
            if (!confirmPassword) {
                setConfirmPasswordError('אימות סיסמה הוא שדה חובה');
            } else if (formData.password !== confirmPassword) {
                setConfirmPasswordError('הסיסמאות אינן תואמות');
            }
            if (!formData.termsAccepted) newErrors.termsAccepted = 'חובה לאשר את תנאי השימוש';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && (!isLogin ? !confirmPasswordError && confirmPassword === formData.password : true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                if (isLogin) {
                    const { session, error } = await supabaseAuthService.signInWithEmail(
                        formData.email,
                        formData.password
                    );

                    if (error) {
                        alert('שגיאה בהתחברות: ' + error.message);
                        return;
                    }

                    if (session) navigate('/admin');
                } else {
                    const { session, error } = await supabaseAuthService.signUpWithEmail(
                        formData.email,
                        formData.password
                    );

                    if (error) {
                        alert('שגיאה בהרשמה: ' + error.message);
                        return;
                    }

                    // Register user in backend database
                    if (session) {
                        try {
                            await BackendService.register({
                                email: formData.email,
                                password: formData.password,
                                fullName: '',
                                description: '',
                                address: '',
                                phone: '',
                                termsAccepted: formData.termsAccepted,
                                logo: null,
                                portfolio: [],
                                instagramUrl: '',
                                tiktokUrl: '',
                                facebookUrl: ''
                            });
                        } catch (backendError) {
                            console.error('Backend registration failed:', backendError);
                            // We continue anyway, as the user might be able to complete profile later
                            // or the error might be "User already exists" which is fine
                        }
                    }

                    alert('הרשמה בוצעה בהצלחה! אנא השלם את הפרופיל שלך.');
                    navigate('/complete-profile');
                }
            } catch (error: any) {
                console.error(error);
                alert(error.message || 'אירעה שגיאה. אנא נסה שנית.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-8 cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Click<span className="text-cyan-500">2</span>Pic</h1>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <button onClick={() => navigate('/')} className="hover:text-cyan-500 transition-colors">דף הבית</button>
                    <button onClick={() => navigate('/contact')} className="hover:text-cyan-500 transition-colors">אודות</button>
                    <a href="#" className="hover:text-cyan-500 transition-colors">תמחור</a>
                    <button onClick={() => navigate('/contact')} className="hover:text-cyan-500 transition-colors">צור קשר</button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            {isLogin ? 'ברוך הבא!' : 'צור חשבון חדש'}
                        </h2>
                        <p className="text-slate-500">
                            {isLogin ? 'התחבר לחשבון הצלם שלך' : 'הצטרף לקהילת הצלמים שלנו'}
                        </p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>{isLogin ? 'התחבר עם גוגל' : 'הירשם עם גוגל'}</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-400">{isLogin ? 'או התחבר באמצעות מייל' : 'או הירשם באמצעות מייל'}</span>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className={`block w-full border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50`}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={`block w-full border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50`}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                {!isLogin && (
                                    <div>
                                        <label htmlFor="confirmPassword"
                                            className="block text-sm font-medium text-slate-700 mb-1">אימות סיסמה</label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className={`block w-full border ${confirmPasswordError ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-slate-50/50`}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) setConfirmPasswordError('');
                                            }}
                                        />
                                        {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                                    </div>
                                )}
                            </div>

                            {isLogin ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 rounded"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label htmlFor="remember-me" className="mr-2 block text-sm text-slate-600">
                                            זכור אותי
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
                                            שכחתי סיסמה
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <input
                                        id="terms"
                                        name="termsAccepted"
                                        type="checkbox"
                                        className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 rounded"
                                        checked={formData.termsAccepted}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor="terms" className="mr-2 block text-sm text-slate-600">
                                        אני מסכים <a href="#" className="text-cyan-600 hover:text-cyan-500">לתנאי השימוש</a>
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'מעבד...' : (isLogin ? 'התחבר' : 'הירשם')}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-600">
                                {isLogin ? (
                                    <>
                                        אין לך חשבון?{' '}
                                        <button
                                            onClick={() => setIsLogin(false)}
                                            className="font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                                        >
                                            לחץ כאן להרשמה
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        כבר יש לך חשבון?{' '}
                                        <button
                                            onClick={() => setIsLogin(true)}
                                            className="font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                                        >
                                            לחץ כאן להתחברות
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex justify-center gap-6 mt-8 text-xs text-slate-400">
                            <a href="#" className="hover:text-slate-600 transition-colors">תנאי שימוש</a>
                            <span>•</span>
                            <a href="#" className="hover:text-slate-600 transition-colors">מדיניות פרטיות</a>
                            <span>•</span>
                            <a href="#" className="hover:text-slate-600 transition-colors">עזרה</a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>
                    <div className="text-sm">
                        © 2024 Click2Pic. כל הזכויות שמורות.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthPage;
