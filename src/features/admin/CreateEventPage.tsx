import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Image as ImageIcon, Check, Calendar, MapPin, Camera, ScanFace, Send, Star, FolderUp, Eye, Trash2, Award, Crown, Plus } from 'lucide-react';
import { BackendService } from '../../services/backendService';
import Layout from '../../components/Layout';
import { Toast } from '../../components';
import EventPreviewModal from './components/EventPreviewModal';
import { GALLERY_THEMES, getThemeByColor } from '../../utils/galleryThemes';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [packageType, setPackageType] = useState<'basic' | 'premium' | 'gold'>(
        (location.state?.packageType as 'basic' | 'premium' | 'gold') || 'basic'
    );

    const [step, setStep] = useState<'details' | 'upload' | 'processing' | 'done'>('details');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
        backgroundColor: '#FDFBF7'
    });
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStage, setProcessingStage] = useState('');
    const [createdEventLink, setCreatedEventLink] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Upgrade suggestion state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [suggestedPackage, setSuggestedPackage] = useState<'premium' | 'gold'>('premium');
    const [attemptedPhotoCount, setAttemptedPhotoCount] = useState(0);

    // Package photo limits
    const PACKAGE_LIMITS = {
        basic: 1200,
        premium: 10000,
        gold: 30000
    };

    const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverPreview(URL.createObjectURL(file));
            setCoverImageFile(file);
        }
    };

    // Helper to traverse directories recursively
    const scanFiles = async (entry: any): Promise<File[]> => {
        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file((file: File) => {
                    resolve([file]);
                });
            });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const allEntries: any[] = [];

            const readAllEntries = async (): Promise<any[]> => {
                return new Promise((resolve) => {
                    dirReader.readEntries(async (entries: any[]) => {
                        if (entries.length === 0) {
                            resolve(allEntries);
                        } else {
                            allEntries.push(...entries);
                            await readAllEntries();
                            resolve(allEntries);
                        }
                    });
                });
            };

            await readAllEntries();
            const promises = allEntries.map((e) => scanFiles(e));
            const files = await Promise.all(promises);
            return files.flat();
        }
        return [];
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const items = e.dataTransfer.items;
        const files: File[] = [];

        if (items) {
            const promises: Promise<File[]>[] = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry?.() || (item as any).getAsEntry?.();
                    if (entry) {
                        promises.push(scanFiles(entry));
                    } else {
                        const file = item.getAsFile();
                        if (file) promises.push(Promise.resolve([file]));
                    }
                }
            }
            const results = await Promise.all(promises);
            files.push(...results.flat());
        } else {
            // Fallback for browsers not supporting DataTransferItem
            files.push(...Array.from(e.dataTransfer.files));
        }

        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (files.length > 0 && imageFiles.length === 0) {
            triggerToast('לא נמצאו תמונות בקבצים/תיקיות שנגררו', 'error');
            return;
        }

        // Check photo limit based on selected package
        const photoLimit = PACKAGE_LIMITS[packageType];
        const totalPhotos = galleryFiles.length + imageFiles.length;

        if (totalPhotos > photoLimit) {
            if (packageType === 'gold') {
                triggerToast('להעלאה של 30000 תמונות נדרש אישור מיוחד (:', 'error');
                return;
            }

            // Determine suggested package
            let suggested: 'premium' | 'gold' = 'premium';
            if (totalPhotos > PACKAGE_LIMITS.premium) {
                suggested = 'gold';
            }

            setAttemptedPhotoCount(totalPhotos);
            setSuggestedPackage(suggested);
            setShowUpgradeModal(true);
            return;
        }

        setGalleryFiles(prev => [...prev, ...imageFiles]);
    };

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));

            if (files.length > 0 && imageFiles.length === 0) {
                triggerToast('לא נמצאו תמונות בתיקייה שנבחרה', 'error');
                return;
            }

            // Check photo limit based on selected package
            const photoLimit = PACKAGE_LIMITS[packageType];
            const totalPhotos = galleryFiles.length + imageFiles.length;

            if (totalPhotos > photoLimit) {
                if (packageType === 'gold') {
                    triggerToast('להעלאה של 30000 תמונות נדרש אישור מיוחד (:', 'error');
                    e.target.value = '';
                    return;
                }

                // Determine suggested package
                let suggested: 'premium' | 'gold' = 'premium';
                if (totalPhotos > PACKAGE_LIMITS.premium) {
                    suggested = 'gold';
                }

                setAttemptedPhotoCount(totalPhotos);
                setSuggestedPackage(suggested);
                setShowUpgradeModal(true);
                e.target.value = '';
                return;
            }

            setGalleryFiles(prev => [...prev, ...imageFiles]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for mandatory fields
        if (!formData.name.trim() || !formData.date || !formData.location.trim()) {
            triggerToast('נא למלא את כל פרטי האירוע', 'error');
            return;
        }

        if (!coverImageFile) {
            triggerToast('נא לבחור תמונת קאבר לאירוע', 'error');
            return;
        }

        if (galleryFiles.length === 0) {
            triggerToast('נא לבחור תמונות לגלריה', 'error');
            return;
        }

        setStep('processing');

        try {
            // 1. Creating Event
            setProcessingStage('יוצר אירוע במערכת...');
            setUploadProgress(0);

            const eventPayload = {
                name: formData.name,
                date: formData.date,
                location: formData.location,
                coverImage: '',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                packageType: packageType,
                backgroundColor: formData.backgroundColor || '#FDFBF7'
            };

            // Create event directly
            const newEvent = await BackendService.createEvent(eventPayload);

            // 2. Redirect to Admin Page with files to upload
            navigate(`/admin/events/${newEvent.id}`, {
                state: {
                    filesToUpload: galleryFiles,
                    coverFile: coverImageFile,
                    isNewEvent: true
                }
            });

        } catch (error: any) {
            console.error('Event creation failed:', error);
            const errorMessage = error.message || 'אירעה שגיאה ביצירת האירוע';
            triggerToast(errorMessage, 'error');
            setStep('details');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">יצירת אירוע חדש</h1>
                        <p className="text-slate-500">מלא את הפרטים כדי לפתוח אירוע ולהעלות את התמונות שלך.</p>
                        <div className="flex items-center justify-center gap-2 text-cyan-600 font-medium text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            <span>האורחים מעלים סלפי והמערכת מוצאת רק את התמונות שלהם.</span>
                        </div>
                    </div>

                    {step === 'details' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Package Display Banner */}
                            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <div className="text-sm opacity-90 mb-1">חבילה נבחרת</div>
                                        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                                            {packageType === 'basic' && (
                                                <>
                                                    <Star className="w-6 h-6" />
                                                    <span>חבילת בסיס</span>
                                                </>
                                            )}
                                            {packageType === 'premium' && (
                                                <>
                                                    <Award className="w-6 h-6" />
                                                    <span>חבילת פרימיום</span>
                                                </>
                                            )}
                                            {packageType === 'gold' && (
                                                <>
                                                    <Crown className="w-6 h-6" />
                                                    <span>חבילת זהב</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Unified Card: Event Details & Cover Image */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                                        <Calendar className="w-5 h-5 text-cyan-500" />
                                        <h2>פרטי האירוע</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Color Theme Selector */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setColorMenuOpen(!colorMenuOpen)}
                                                className="bg-white text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-sm border border-slate-200"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full border border-slate-300"
                                                    style={{ backgroundColor: getThemeByColor(formData.backgroundColor).accentColor }}
                                                ></div>
                                                <span>צבע גלריה</span>
                                                <svg className={`w-4 h-4 transition-transform ${colorMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {colorMenuOpen && (
                                                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        {GALLERY_THEMES.map((theme) => (
                                                            <button
                                                                key={theme.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, backgroundColor: theme.backgroundColor }));
                                                                    setColorMenuOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors ${formData.backgroundColor === theme.backgroundColor ? 'bg-cyan-50 border border-cyan-200' : ''
                                                                    }`}
                                                            >
                                                                <div
                                                                    className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"
                                                                    style={{ backgroundColor: theme.accentColor }}
                                                                ></div>
                                                                <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                                                                {formData.backgroundColor === theme.backgroundColor && (
                                                                    <Check className="w-4 h-4 text-cyan-600 mr-auto" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsPreviewOpen(true)}
                                            className="bg-cyan-50 text-cyan-600 px-6 py-2 rounded-xl font-bold hover:bg-cyan-100 transition-colors flex items-center gap-2 shadow-sm text-sm border border-cyan-100"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>תצוגה מקדימה</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-4">
                                    {/* Right Column: Details Inputs */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2 text-right">שם האירוע</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder='חתונה - שירה ודוד / יום הולדת 30 / כנס חברה...'
                                                className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-right"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2 text-right">תאריך האירוע</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                    className="block w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-right"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2 text-right">מיקום האירוע</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="אולמי XYZ, תל אביב"
                                                    className="block w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-right"
                                                />
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Left Column: Cover Image Upload */}
                                    <div className="flex flex-col h-full">
                                        <label className="block text-sm font-medium text-slate-700 mb-2 text-right">תמונת קאבר</label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group flex-1 w-full mx-auto flex flex-col items-center justify-center bg-slate-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {coverPreview ? (
                                                <div className="absolute inset-2 rounded-lg overflow-hidden shadow-sm">
                                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white font-medium">לחץ להחלפה</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-cyan-500 transition-colors shadow-sm">
                                                        <Upload className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-slate-600 font-medium text-lg">לחץ להעלאת תמונת קאבר</p>
                                                    <p className="text-slate-400 text-sm mt-2">או גרור תמונה לכאן</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Card 3: Gallery Images */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-2">
                                        <ImageIcon className="w-5 h-5 text-cyan-500" />
                                        <h2>העלאת תמונות האירוע</h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-600">מגבלת תמונות בחבילה:</span>
                                        <span className="font-bold text-cyan-600 text-base">
                                            {packageType === 'gold' ? 'אין הגבלה' : PACKAGE_LIMITS[packageType].toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors relative group"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        id="gallery-file-input"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryFilesChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    {/* Hidden Folder Input */}
                                    <input
                                        type="file"
                                        multiple
                                        // @ts-ignore
                                        webkitdirectory=""
                                        // @ts-ignore
                                        directory=""
                                        onChange={handleGalleryFilesChange}
                                        className="hidden"
                                        ref={folderInputRef}
                                    />

                                    <div className="flex flex-col items-center justify-center py-4 relative z-20 pointer-events-none">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-cyan-500 transition-colors">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-600 font-medium text-lg">גרור תמונות או תיקיות לכאן</p>
                                        <p className="text-slate-400 text-sm mt-1 mb-4">או בחר אפשרות העלאה:</p>

                                        <div className="flex gap-4 pointer-events-auto">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('gallery-file-input')?.click()}
                                                className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-lg font-bold hover:bg-cyan-100 transition-colors text-sm"
                                            >
                                                בחר תמונות
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => folderInputRef.current?.click()}
                                                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
                                            >
                                                <FolderUp className="w-4 h-4" />
                                                בחר תיקייה
                                            </button>
                                        </div>
                                    </div>

                                    {galleryFiles.length > 0 && (
                                        <div className="mt-6 mx-auto max-w-xs bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center justify-between relative z-20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-slate-800 text-base">
                                                        נבחרו {galleryFiles.length} תמונות
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        מוכנות להעלאה
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setGalleryFiles([]);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="נקה בחירה"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-cyan-500 text-white py-3.5 rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-500/30"
                                >
                                    צור אירוע
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin')}
                                    className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    בטל
                                </button>
                            </div>

                            <p className="text-center text-xs text-slate-400">
                                תוכל לערוך את פרטי האירוע גם לאחר יצירתו.
                            </p>
                        </form>
                    )}

                    {step === 'processing' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent animate-spin"
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-slate-700">
                                    {uploadProgress}%
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">מעבד נתונים...</h3>
                            <p className="text-slate-500 text-lg animate-pulse">{processingStage}</p>

                            <div className="mt-10 max-w-md mx-auto bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Check className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">האירוע נוצר בהצלחה! 🎉</h2>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                                התמונות הועלו, עברו זיהוי פנים והגלריה מוכנה לשיתוף.
                            </p>

                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between max-w-xl mx-auto mb-10 border border-slate-200 gap-4">
                                <div className="text-right w-full overflow-hidden">
                                    <p className="text-xs text-slate-500 mb-1">קישור לאירוע:</p>
                                    <code className="text-cyan-700 font-mono text-lg truncate block w-full">
                                        {createdEventLink}
                                    </code>
                                </div>
                                <button
                                    onClick={() => window.open(createdEventLink, '_blank')}
                                    className="bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm w-full md:w-auto whitespace-nowrap"
                                >
                                    מעבר לאירוע
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                                >
                                    חזרה לדשבורד
                                </button>
                                <button
                                    onClick={() => window.open(createdEventLink, '_blank')}
                                    className="px-8 py-4 bg-white text-cyan-600 border-2 border-cyan-100 rounded-xl font-bold hover:bg-cyan-50 transition-colors"
                                >
                                    צפה בגלריה
                                </button>
                            </div>
                        </div>
                    )}

                    {/* How it works Footer */}
                    <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <h3 className="text-xl font-bold text-slate-900">איך זה עובד? המדריך לתהליך הסלפי</h3>
                            <div className="bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">i</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold text-xl shadow-sm mb-4">1</div>
                                <h4 className="font-bold text-slate-900 mb-2">האורח מצלם סלפי</h4>
                                <p className="text-sm text-slate-600">האורח מצלם סלפי עם הפנים שלו באירוע</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold text-xl shadow-sm mb-4">2</div>
                                <h4 className="font-bold text-slate-900 mb-2">זיהוי פנים אוטומטי</h4>
                                <p className="text-sm text-slate-600">המערכת מזהה את הפנים בתמונה</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold text-xl shadow-sm mb-4">3</div>
                                <h4 className="font-bold text-slate-900 mb-2">קבלת כל התמונות</h4>
                                <p className="text-sm text-slate-600">האורח מקבל רק את התמונות שבהן הוא מופיע</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Upgrade Suggestion Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6">
                            <div className="flex items-center justify-center">
                                <Upload className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                רגע! יש לך הרבה תמונות 📸
                            </h3>
                            <p className="text-slate-700 text-lg mb-4">
                                בחרת להעלות <span className="font-bold text-cyan-600">{attemptedPhotoCount.toLocaleString()}</span> תמונות
                            </p>
                            <p className="text-slate-600 mb-6">
                                החבילה שלך מאפשרת עד <span className="font-bold">{PACKAGE_LIMITS[packageType].toLocaleString()}</span> תמונות.
                                <br />
                                מה דעתך לעבור לחבילת <span className="font-bold text-cyan-600">
                                    {suggestedPackage === 'premium' ? 'פרימיום' : 'זהב'}
                                </span>?
                            </p>
                            <div className="bg-cyan-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {suggestedPackage === 'premium' ? (
                                        <Award className="w-6 h-6 text-cyan-600" />
                                    ) : (
                                        <Crown className="w-6 h-6 text-cyan-600" />
                                    )}
                                    <div className="text-sm text-slate-600">
                                        חבילת {suggestedPackage === 'premium' ? 'פרימיום' : 'זהב'}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-cyan-600">
                                    {suggestedPackage === 'gold' ? 'ללא הגבלת תמונות' : `עד ${PACKAGE_LIMITS[suggestedPackage].toLocaleString()} תמונות`}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => {
                                    setPackageType(suggestedPackage);
                                    setShowUpgradeModal(false);
                                    triggerToast('החבילה שודרגה בהצלחה! ✨', 'success');
                                }}
                                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold transition-colors"
                            >
                                עבור לחבילת {suggestedPackage === 'premium' ? 'פרימיום' : 'זהב'}
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EventPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                data={{
                    name: formData.name,
                    date: formData.date,
                    location: formData.location,
                    coverImage: coverPreview,
                    backgroundColor: formData.backgroundColor,
                    photographerName: localStorage.getItem('photographerName') || 'שם הצלם',
                    photographerImage: localStorage.getItem('photographerImage') || ''
                }}
            />
            <Toast
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />
        </Layout>
    );
};

export default CreateEventPage;
