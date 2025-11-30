import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, Instagram, Mail, Lock, MapPin, Phone, User, FileText } from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa';
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
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Check for OAuth callback
    useEffect(() => {
        let hasRun = false;

        const handleOAuthCallback = async () => {
            if (hasRun) return;
            hasRun = true;

            console.log('Checking for OAuth session...');
            const { session, error } = await supabaseAuthService.getSession();

            if (error) {
                console.error('Supabase session error:', error);
                return;
            }

            if (!session) {
                console.log('No Supabase session found');
                return;
            }

            console.log('Supabase session found for user:', session.user.email);

            // Check if this is from an OAuth callback
            const hasHash = window.location.hash.includes('access_token');
            console.log('URL hash present:', hasHash);

            if (!hasHash) {
                return;
            }

            // User authenticated via OAuth
            const user = session.user;

            try {
                // First, check if user already has a profile
                console.log('Checking if profile exists...');
                await BackendService.getProfile();
                // If successful, user exists -> redirect to admin
                console.log('Profile exists, redirecting to admin');
                navigate('/admin');
            } catch (err) {
                console.log('Profile not found (expected for new users). Attempting registration...');
                // Profile not found, need to register
                try {
                    // Create basic user account via /auth/register
                    console.log('Calling BackendService.register...');
                    await BackendService.register({
                        email: user.email || '',
                        password: '', // Not needed for OAuth
                        fullName: '',
                        description: '',
                        address: '',
                        phone: '',
                        termsAccepted: true, // Implicit acceptance via OAuth
                        logo: null,
                        portfolio: [],
                        instagramUrl: '',
                        tiktokUrl: '',
                        facebookUrl: ''
                    });

                    console.log('User account created successfully, redirecting to admin');
                    navigate('/admin');
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

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handlePortfolioUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 3);
            setFormData(prev => ({ ...prev, portfolio: files }));
            const previews = files.map(file => URL.createObjectURL(file));
            setPortfolioPreviews(previews);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { error } = await supabaseAuthService.signInWithGoogle();
            if (error) {
                alert('שגיאה בהתחברות עם Google: ' + error.message);
            }
            // Redirect will happen automatically
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
            // Check password confirmation
            if (!confirmPassword) {
                setConfirmPasswordError('אימות סיסמה הוא שדה חובה');
            } else if (formData.password !== confirmPassword) {
                setConfirmPasswordError('הסיסמאות אינן תואמות');
            }

            // Profile fields are no longer validated here - they'll be collected on the profile completion page
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
                    // Login with Supabase only
                    const { user, session, error } = await supabaseAuthService.signInWithEmail(
                        formData.email,
                        formData.password
                    );

                    if (error) {
                        alert('שגיאה בהתחברות: ' + error.message);
                        return;
                    }

                    if (session) {
                        navigate('/admin');
                    }
                } else {
                    // Register with Supabase - only email and password
                    const { user, session, error } = await supabaseAuthService.signUpWithEmail(
                        formData.email,
                        formData.password
                    );

                    if (error) {
                        alert('שגיאה בהרשמה: ' + error.message);
                        return;
                    }

                    console.log('Supabase signup successful:', { user: user?.email, hasSession: !!session });

                    // Check if we have a session (required for backend registration)
                    if (!session) {
                        alert('הרשמה בוצעה בהצלחה! אנא בדוק את האימייל שלך לאימות החשבון.');
                        return;
                    }

                    // Now register with backend to create user profile
                    try {
                        console.log('Calling backend registration with token...');
                        await BackendService.register({
                            email: formData.email,
                            password: '', // Not needed for backend with Supabase auth
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
                        console.log('Backend registration successful');
                    } catch (backendError: any) {
                        console.error('Backend registration failed:', backendError);
                        alert('הרשמה בוצעה בהצלחה, אך יש בעיה בשמירת הפרטים. אנא פנה לתמיכה.');
                        return;
                    }

                    // Redirect to admin page
                    alert('הרשמה בוצעה בהצלחה!');
                    navigate('/admin');
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
        <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-stone-900 rounded-full flex items-center justify-center mb-4">
                        <Camera className="h-8 w-8 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900">
                        {isLogin ? 'התחברות לצלמים' : 'הרשמה לצלמים'}
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                        {isLogin ? 'אין לך עדיין חשבון?' : 'כבר יש לך חשבון?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-amber-600 hover:text-amber-500 mr-1"
                        >
                            {isLogin ? 'הירשם עכשיו' : 'התחבר'}
                        </button>
                    </p>
                </div>

                {/* Google Sign In Button - Show in both login and registration modes */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-stone-300 rounded-lg shadow-sm bg-white text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>המשך עם גוגל</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-stone-500">או</span>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email & Password - Always visible */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="אימייל"
                                    autoComplete="email"
                                    className={`block w-full pr-10 border ${errors.email ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="סיסמה"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    className={`block w-full pr-10 border ${errors.password ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation - Only show during registration */}
                            {!isLogin && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-stone-400" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="אימות סיסמה"
                                        autoComplete="new-password"
                                        className={`block w-full pr-10 border ${confirmPasswordError ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (confirmPasswordError) setConfirmPasswordError('');
                                        }}
                                    />
                                    {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                                </div>
                            )}

                            {/* Terms Acceptance - Only show during registration */}
                            {!isLogin && (
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center">
                                        <input
                                            id="terms"
                                            name="termsAccepted"
                                            type="checkbox"
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                                            checked={formData.termsAccepted}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label htmlFor="terms" className="mr-2 block text-sm text-stone-900">
                                            אני מסכים <a href="#" className="text-amber-600 hover:text-amber-500">לתנאי השימוש</a>
                                        </label>
                                    </div>
                                    {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'מעבד...' : (isLogin ? 'התחבר' : 'הירשם')}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default AuthPage;
