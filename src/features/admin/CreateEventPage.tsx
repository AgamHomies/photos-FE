import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Check, Calendar, MapPin, Camera, ScanFace, Send, Star } from 'lucide-react';
import { BackendService } from '../../services/backendService';
import Layout from '../../components/Layout';
import { Toast } from '../../components';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'details' | 'upload' | 'processing' | 'done'>('details');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: ''
    });
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStage, setProcessingStage] = useState('');
    const [createdEventLink, setCreatedEventLink] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGalleryFiles(Array.from(e.target.files));
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
            setUploadProgress(10);

            const newEvent = await BackendService.createEvent({
                name: formData.name,
                date: formData.date,
                location: formData.location,
                coverImage: '',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });

            // 2. Redirect to Admin Page with files to upload
            navigate(`/admin/events/${newEvent.id}`, {
                state: {
                    filesToUpload: galleryFiles,
                    coverFile: coverImageFile,
                    isNewEvent: true
                }
            });

        } catch (error) {
            console.error(error);
            triggerToast('אירעה שגיאה ביצירת האירוע', 'error');
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

                            {/* Card 1: Event Details */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
                                <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg">
                                    <Calendar className="w-5 h-5 text-cyan-500" />
                                    <h2>פרטי האירוע</h2>
                                </div>

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
                            </div>

                            {/* Card 2: Cover Image */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
                                <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg">
                                    <ImageIcon className="w-5 h-5 text-cyan-500" />
                                    <h2>תמונת קאבר</h2>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {coverPreview ? (
                                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-medium">לחץ להחלפה</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-cyan-500 transition-colors">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="text-slate-600 font-medium">לחץ להעלאת תמונת קאבר</p>
                                            <p className="text-slate-400 text-sm mt-1">או גרור תמונה לכאן</p>
                                            <p className="text-slate-400 text-xs mt-1">מומלץ יחס 16:9</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 3: Gallery Images */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8">
                                <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-lg">
                                    <ImageIcon className="w-5 h-5 text-cyan-500" />
                                    <h2>העלאת תמונות האירוע</h2>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryFilesChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-cyan-500 transition-colors">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-600 font-medium">בחר תמונות להעלאה</p>
                                        <p className="text-slate-400 text-sm mt-1">תמיכה בהעלאת מספר תמונות בו זמנית</p>
                                        <p className="text-slate-400 text-xs mt-1">גרור תמונות לכאן או לחץ לבחירה</p>
                                    </div>
                                    {galleryFiles.length > 0 && (
                                        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                                            <Check className="w-4 h-4" />
                                            נבחרו {galleryFiles.length} תמונות
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
