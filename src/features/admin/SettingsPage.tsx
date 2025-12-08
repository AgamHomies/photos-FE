import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Instagram, MapPin, Phone, User, FileText, Mail, Globe, Save } from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa';
import { PhotographerProfile } from '../../types';
import { BackendService } from '../../services/backendService';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import { Toast } from '../../components';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '', // Contact email
        description: '',
        address: '',
        phone: '',
        logo: null as File | null,
        websiteUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        facebookUrl: ''
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
        const fetchProfile = async () => {
            try {
                const profile = await BackendService.getProfile();

                if (profile) {
                    setFormData({
                        fullName: profile.name || user?.user_metadata?.full_name || '',
                        email: profile.contactEmail || user?.email || '',
                        description: profile.bio || '',
                        address: profile.address || '',
                        phone: profile.phone || '',
                        logo: null,
                        websiteUrl: profile.websiteUrl || '',
                        instagramUrl: profile.instagramUrl || '',
                        tiktokUrl: profile.tiktokUrl || '',
                        facebookUrl: profile.facebookUrl || ''
                    });
                    setLogoPreview(profile.profileImageUrl || null);
                } else if (user) {
                    // Fallback to Supabase data if backend profile is missing
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.user_metadata?.full_name || '',
                        email: user.email || '',
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.user_metadata?.full_name || '',
                        email: user.email || '',
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
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
        // Logo is optional
        if (formData.description && formData.description.length > 150) newErrors.description = 'תיאור מוגבל ל-150 תווים';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const updates: Partial<PhotographerProfile> = {
                    name: formData.fullName,
                    contactEmail: formData.email,
                    bio: formData.description,
                    address: formData.address,
                    phone: formData.phone,
                    websiteUrl: formData.websiteUrl,
                    instagramUrl: formData.instagramUrl,
                    tiktokUrl: formData.tiktokUrl,
                    facebookUrl: formData.facebookUrl,
                    logo: formData.logo || undefined,
                };

                // Note: File upload for logo needs to be handled if supported by backend update
                // Currently assuming text updates only for this iteration or separate endpoint

                await BackendService.updateProfile(updates);

                // Update Supabase user metadata
                await supabaseAuthService.updateUserData({
                    data: { full_name: formData.fullName }
                });

                triggerToast('הפרופיל עודכן בהצלחה!');
                setTimeout(() => navigate('/admin'), 1500); // Give user time to see toast
            } catch (error: any) {
                console.error('Failed to update profile:', error);
                triggerToast('שגיאה בעדכון הפרופיל. אנא נסה שנית.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-5xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-12">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 text-cyan-500">
                            <User className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            הגדרות פרופיל
                        </h1>
                        <p className="text-slate-500">
                            עדכן את פרטי הפרופיל והעסק שלך
                        </p>
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

                        {/* Buttons */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'שומר...' : 'שמור שינויים'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="w-full flex justify-center py-3.5 px-4 border border-slate-200 text-sm font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Toast
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />
        </Layout>
    );
};

export default SettingsPage;
