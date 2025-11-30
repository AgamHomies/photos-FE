import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Instagram, MapPin, Phone, User, FileText } from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa';
import { PhotographerRegistration } from '../../types';
import { BackendService } from '../../services/backendService';
import Layout from '../../components/Layout';

const ProfileCompletionPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        description: '',
        address: '',
        phone: '',
        logo: null as File | null,
        portfolio: [] as File[],
        instagramUrl: '',
        tiktokUrl: '',
        facebookUrl: ''
    });
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);

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

    const handlePortfolioUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 3);
            setFormData(prev => ({ ...prev, portfolio: files }));
            const previews = files.map(file => URL.createObjectURL(file));
            setPortfolioPreviews(previews);
        }
    };

    const validateForm = () => {
        const newErrors: Partial<Record<string, string>> = {};

        if (!formData.fullName) newErrors.fullName = 'שם מלא/עסק הוא שדה חובה';
        if (!formData.description) newErrors.description = 'תיאור הוא שדה חובה';
        if (formData.description.length > 150) newErrors.description = 'תיאור מוגבל ל-150 תווים';
        if (!formData.address) newErrors.address = 'כתובת היא שדה חובה';
        if (!formData.phone) newErrors.phone = 'טלפון הוא שדה חובה';

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
                    description: formData.description,
                    address: formData.address,
                    phone: formData.phone,
                    logo: formData.logo,
                    portfolio: formData.portfolio,
                    instagramUrl: formData.instagramUrl,
                    tiktokUrl: formData.tiktokUrl,
                    facebookUrl: formData.facebookUrl,
                };

                await BackendService.completeProfile(profileData);
                alert('הפרופיל הושלם בהצלחה!');
                navigate('/admin');
            } catch (error: any) {
                console.error('Failed to complete profile:', error);
                alert('שגיאה בשמירת הפרופיל. אנא נסה שנית.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 text-cyan-500">
                            <Camera className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            השלמת פרופיל צלם
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            אנא מלא את הפרטים הבאים כדי להשלים את הפרופיל שלך
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="שם מלא / שם העסק"
                                    className={`block w-full pr-10 border ${errors.fullName ? 'border-red-500' : 'border-slate-200'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="טלפון"
                                    className={`block w-full pr-10 border ${errors.phone ? 'border-red-500' : 'border-slate-200'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            <div className="relative col-span-1 md:col-span-2">
                                <div className="absolute inset-y-0 right-0 pr-3 pt-3 pointer-events-none text-slate-400">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <input
                                    name="address"
                                    type="text"
                                    placeholder="כתובת"
                                    className={`block w-full pr-10 border ${errors.address ? 'border-red-500' : 'border-slate-200'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            <div className="relative col-span-1 md:col-span-2">
                                <div className="absolute inset-y-0 right-0 pr-3 pt-3 pointer-events-none text-slate-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <textarea
                                    name="description"
                                    placeholder="תיאור קצר (עד 150 תווים)"
                                    maxLength={150}
                                    rows={3}
                                    className={`block w-full pr-10 border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors`}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                                <div className="text-left text-xs text-slate-400 mt-1">
                                    {formData.description.length}/150
                                </div>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            {/* Social Media URLs */}
                            <div className="relative col-span-1 md:col-span-2">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <Instagram className="h-5 w-5" />
                                </div>
                                <input
                                    name="instagramUrl"
                                    type="url"
                                    placeholder="קישור לאינסטגרם (אופציונלי)"
                                    className="block w-full pr-10 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    value={formData.instagramUrl}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    {/* @ts-ignore */}
                                    <FaTiktok className="h-5 w-5" />
                                </div>
                                <input
                                    name="tiktokUrl"
                                    type="url"
                                    placeholder="קישור לטיקטוק (אופציונלי)"
                                    className="block w-full pr-10 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    value={formData.tiktokUrl}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    {/* @ts-ignore */}
                                    <FaFacebook className="h-5 w-5" />
                                </div>
                                <input
                                    name="facebookUrl"
                                    type="url"
                                    placeholder="קישור לפייסבוק (אופציונלי)"
                                    className="block w-full pr-10 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    value={formData.facebookUrl}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* File Uploads */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">לוגו העסק</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border border-slate-200">
                                        <Upload className="w-4 h-4" />
                                        <span>בחר קובץ</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                    </label>
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo Preview" className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                                    )}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">תיק עבודות (3 תמונות)</label>
                                <div className="flex flex-col gap-4">
                                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 w-fit transition-colors border border-slate-200">
                                        <Upload className="w-4 h-4" />
                                        <span>בחר תמונות</span>
                                        <input type="file" accept="image/*" multiple max={3} className="hidden" onChange={handlePortfolioUpload} />
                                    </label>
                                    <div className="flex gap-4">
                                        {portfolioPreviews.map((src, index) => (
                                            <img key={index} src={src} alt={`Portfolio ${index}`} className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-3 pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'שומר...' : 'השלם פרופיל'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="w-full flex justify-center py-3.5 px-4 border border-slate-200 text-sm font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                            >
                                השלם מאוחר יותר
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ProfileCompletionPage;
