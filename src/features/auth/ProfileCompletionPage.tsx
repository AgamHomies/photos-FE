import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Instagram, MapPin, Phone, User, FileText, Mail, Globe, LogOut } from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa';
import { PhotographerRegistration } from '../../types';
import { BackendService } from '../../services/backendService';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from '../../components';

const ProfileCompletionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: user?.email || '',
        description: '',
        address: '',
        phone: '',
        logo: null as File | null,
        websiteUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        facebookUrl: '',
        termsAccepted: false
    });
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    useEffect(() => {
        const state = location.state as { message?: string };
        if (state?.message) {
            triggerToast(state.message);
            // Clear state so it doesn't show again on refresh (optional but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
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

    const validateForm = () => {
        const newErrors: Partial<Record<string, string>> = {};

        if (!formData.fullName) newErrors.fullName = 'שם מלא/עסק הוא שדה חובה';
        if (!formData.email) newErrors.email = 'אימייל הוא שדה חובה';
        if (!formData.phone) newErrors.phone = 'טלפון הוא שדה חובה';
        // Logo is now optional
        if (formData.description && formData.description.length > 150) newErrors.description = 'תיאור מוגבל ל-150 תווים';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'חובה לאשר את תנאי השימוש';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const profileData: Partial<PhotographerRegistration> = {
                    fullName: formData.fullName,
                    email: formData.email,
                    description: formData.description,
                    address: formData.address,
                    phone: formData.phone,
                    logo: formData.logo,
                    portfolio: [],
                    instagramUrl: formData.instagramUrl,
                    tiktokUrl: formData.tiktokUrl,
                    facebookUrl: formData.facebookUrl,
                };

                await BackendService.completeProfile(profileData);

                // Update Supabase user metadata
                await supabaseAuthService.updateUserData({
                    data: { full_name: formData.fullName }
                });

                // alert('הפרופיל הושלם בהצלחה!');
                navigate('/profile-success');
            } catch (error: any) {
                console.error('Failed to complete profile:', error);
                triggerToast('שגיאה בשמירת הפרופיל. אנא נסה שנית.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col font-sans" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Click2Pic" className="h-8" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button className="flex items-center gap-2 focus:outline-none">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 border-2 border-white shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="hidden md:block text-sm font-medium text-slate-700">{user?.email}</span>
                        </button>

                        {/* Dropdown */}
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full text-right px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                התנתק
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                            ברוך הבא! בוא נכיר את העסק שלך כדי להתאים את החווייה
                        </h1>
                        <p className="text-slate-500 mb-4">
                            מלא את פרטי הצלם והמותג שלך כדי שהמערכת תתייג אותך כראוי בכל הורדה ובכל אירוע.
                        </p>

                        {/* First Time Alert */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 inline-block">
                            שים לב: הגדרת הפרטים הראשונית מתבצעת באופן חד-פעמי בעת הכניסה הראשונה למערכת.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* פרטים בסיסיים */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-cyan-500" />
                                <h2 className="text-xl font-bold text-slate-900">פרטים בסיסיים</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        שם מלא / שם עסק <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="הכנס את שם העסק או השם המלא שלך"
                                            className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-slate-200'} rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        אימייל <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="photographer@example.com"
                                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white`}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        טלפון <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="05X-XXXXXXX"
                                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-slate-200'} rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        כתובת העסק
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="רחוב, מספר, עיר"
                                            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        תיאור קצר
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                                        <textarea
                                            name="description"
                                            placeholder="ספר קצת על העסק שלך..."
                                            maxLength={150}
                                            rows={3}
                                            className={`w-full border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none`}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="text-left text-xs text-slate-400 mt-1">
                                        {formData.description.length}/150
                                    </div>
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* מיתוג הצלם */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-5 h-5 text-cyan-500" />
                                <h2 className="text-xl font-bold text-slate-900">מיתוג הצלם</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    העלאת לוגו (אופציונלי)
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="logo-upload"
                                        onChange={handleLogoUpload}
                                    />
                                    <label htmlFor="logo-upload" className="cursor-pointer w-full h-full block">
                                        {logoPreview ? (
                                            <div className="flex flex-col items-center">
                                                <img src={logoPreview} alt="Logo Preview" className="h-24 w-24 object-contain mb-2" />
                                                <p className="text-sm text-cyan-600">לחץ להחלפת הלוגו</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                    <Upload className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-600 font-medium mb-1">לחץ להעלאת לוגו</p>
                                                <p className="text-xs text-slate-400">PNG, JPG עד 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                                <p className="text-xs text-slate-500 mt-2">הלוגו יופיע על התמונות והגלריות שתיצור</p>
                            </div>
                        </div>

                        {/* קישורים של העסק */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-cyan-500" />
                                <h2 className="text-xl font-bold text-slate-900">קישורים של העסק</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        כתובת אתר העסק
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="websiteUrl"
                                            placeholder="https://www.mybusiness.com"
                                            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            value={formData.websiteUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        אינסטגרם
                                    </label>
                                    <div className="relative">
                                        <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="instagramUrl"
                                            placeholder="https://instagram.com/yourprofile"
                                            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            value={formData.instagramUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        פייסבוק
                                    </label>
                                    <div className="relative">
                                        <FaFacebook className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="facebookUrl"
                                            placeholder="https://facebook.com/..."
                                            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            value={formData.facebookUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        טיקטוק
                                    </label>
                                    <div className="relative">
                                        <FaTiktok className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="tiktokUrl"
                                            placeholder="https://tiktok.com/@..."
                                            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            value={formData.tiktokUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                name="termsAccepted"
                                className="mt-1 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 rounded"
                                checked={formData.termsAccepted}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="terms" className="text-sm text-slate-600">
                                אני מאשר/ת את{' '}
                                <a href="#" className="text-cyan-600 hover:text-cyan-500">
                                    תנאי השימוש
                                </a>{' '}
                                של Click2Pic לקריאה המלאים
                            </label>
                        </div>
                        {errors.termsAccepted && <p className="text-red-500 text-xs mr-6">{errors.termsAccepted}</p>}

                        {/* Buttons */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-cyan-500 text-white font-bold py-4 rounded-xl hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'שומר פרטים...' : 'שמור פרטים והתחל להשתמש במערכת'}
                            </button>


                        </div>

                        <p className="text-xs text-center text-slate-500">
                            תוכל לערוך את הפרטים האלה בכל עת בהגדרות הפרופיל.
                        </p>
                    </form>
                </div>
            </main>
        <Toast 
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default ProfileCompletionPage;
