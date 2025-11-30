import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Instagram, MapPin, Phone, User, FileText } from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa';
import { PhotographerRegistration } from '../../types';
import { BackendService } from '../../services/backendService';

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
                // Create profile data object
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

                // Call new completeProfile endpoint
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
        <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-stone-900 rounded-full flex items-center justify-center mb-4">
                        <Camera className="h-8 w-8 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900">
                        השלמת פרופיל צלם
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                        אנא מלא את הפרטים הבאים כדי להשלים את הפרופיל שלך
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                name="fullName"
                                type="text"
                                placeholder="שם מלא / שם העסק"
                                className={`block w-full pr-10 border ${errors.fullName ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="טלפון"
                                className={`block w-full pr-10 border ${errors.phone ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div className="relative col-span-1 md:col-span-2">
                            <div className="absolute inset-y-0 right-0 pr-3 pt-3 pointer-events-none">
                                <MapPin className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                name="address"
                                type="text"
                                placeholder="כתובת"
                                className={`block w-full pr-10 border ${errors.address ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>

                        <div className="relative col-span-1 md:col-span-2">
                            <div className="absolute inset-y-0 right-0 pr-3 pt-3 pointer-events-none">
                                <FileText className="h-5 w-5 text-stone-400" />
                            </div>
                            <textarea
                                name="description"
                                placeholder="תיאור קצר (עד 150 תווים)"
                                maxLength={150}
                                rows={3}
                                className={`block w-full pr-10 border ${errors.description ? 'border-red-500' : 'border-stone-300'} rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500`}
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                            <div className="text-left text-xs text-stone-400 mt-1">
                                {formData.description.length}/150
                            </div>
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        {/* Social Media URLs */}
                        <div className="relative col-span-1 md:col-span-2">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Instagram className="h-5 w-5 text-stone-400" />
                            </div>
                            <input
                                name="instagramUrl"
                                type="url"
                                placeholder="קישור לאינסטגרם (אופציונלי)"
                                className="block w-full pr-10 border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                value={formData.instagramUrl}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                                {/* @ts-ignore: react-icons type mismatch with React 19 */}
                                <FaTiktok className="h-5 w-5" />
                            </div>
                            <input
                                name="tiktokUrl"
                                type="url"
                                placeholder="קישור לטיקטוק (אופציונלי)"
                                className="block w-full pr-10 border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                value={formData.tiktokUrl}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                                {/* @ts-ignore: react-icons type mismatch with React 19 */}
                                <FaFacebook className="h-5 w-5" />
                            </div>
                            <input
                                name="facebookUrl"
                                type="url"
                                placeholder="קישור לפייסבוק (אופציונלי)"
                                className="block w-full pr-10 border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                value={formData.facebookUrl}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* File Uploads */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-stone-700 mb-2">לוגו העסק</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span>בחר קובץ</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                </label>
                                {logoPreview && (
                                    <img src={logoPreview} alt="Logo Preview" className="h-12 w-12 rounded-full object-cover border border-stone-200" />
                                )}
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-stone-700 mb-2">תיק עבודות (3 תמונות)</label>
                            <div className="flex flex-col gap-4">
                                <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg flex items-center gap-2 w-fit transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span>בחר תמונות</span>
                                    <input type="file" accept="image/*" multiple max={3} className="hidden" onChange={handlePortfolioUpload} />
                                </label>
                                <div className="flex gap-4">
                                    {portfolioPreviews.map((src, index) => (
                                        <img key={index} src={src} alt={`Portfolio ${index}`} className="h-20 w-20 object-cover rounded-lg border border-stone-200" />
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'שומר...' : 'השלם פרופיל'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="w-full flex justify-center py-3 px-4 border border-stone-300 text-sm font-medium rounded-lg text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileCompletionPage;
