import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, MapPin, Image as ImageIcon, Check, Loader2, ArrowRight, FileText } from 'lucide-react';
import { MockS3Service } from '../../services/mockS3';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'details' | 'upload' | 'processing' | 'done'>('details');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: ''
    });
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStage, setProcessingStage] = useState('');
    const [createdEventLink, setCreatedEventLink] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGalleryFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');

        try {
            // 1. Creating Event
            setProcessingStage('יוצר אירוע במערכת...');
            setUploadProgress(10);
            await new Promise(resolve => setTimeout(resolve, 800));

            // 2. Uploading Cover
            setProcessingStage('מעלה תמונת קאבר...');
            setUploadProgress(30);
            await new Promise(resolve => setTimeout(resolve, 800));

            // 3. Uploading Gallery Photos
            setProcessingStage(`מעלה ${galleryFiles.length} תמונות ל-S3...`);
            setUploadProgress(60);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate bulk upload

            // 4. AI Processing
            setProcessingStage('מבצע זיהוי פנים (Face Indexing)...');
            setUploadProgress(85);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing

            // 5. Finalizing
            setProcessingStage('בונה אוספים ומפיק קישור ייחודי...');
            setUploadProgress(100);

            const newEvent = await MockS3Service.createEvent({
                name: formData.name,
                date: formData.date,
                location: formData.location,
                coverImage: coverPreview || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.0.3&auto=format&fit=crop&w=800&q=80',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });

            setCreatedEventLink(newEvent.uniqueLink);
            setStep('done');

        } catch (error) {
            console.error(error);
            alert('אירעה שגיאה ביצירת האירוע');
            setStep('details');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-stone-900 px-8 py-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">יצירת אירוע חדש</h1>
                    <button onClick={() => navigate('/admin')} className="text-stone-400 hover:text-white transition-colors">
                        חזרה לדשבורד
                    </button>
                </div>

                <div className="p-8">
                    {step === 'details' && (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Event Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    פרטי האירוע
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-stone-700 mb-2">שם האירוע</label>
                                        <input
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder='לדוגמה: "החתונה של דנה ויוסי"'
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-stone-700 mb-2">תיאור קצר</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={2}
                                            placeholder="תיאור שיופיע לאורחים..."
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">תאריך</label>
                                        <input
                                            required
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">מיקום</label>
                                        <input
                                            required
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="שם האולם / מקום"
                                            className="block w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-stone-100 pt-8 space-y-6">
                                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-amber-600" />
                                    מדיה ותמונות
                                </h3>

                                {/* Cover Image */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">תמונת קאבר (Cover Image)</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-32 h-32 bg-stone-100 rounded-xl overflow-hidden border-2 border-dashed border-stone-300 flex items-center justify-center group hover:border-amber-500 transition-colors">
                                            {coverPreview ? (
                                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-stone-400" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="text-sm text-stone-500">
                                            <p>בחר תמונה ראשית שתופיע בראש הגלריה.</p>
                                            <p>מומלץ להשתמש בתמונה רוחבית איכותית.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">העלאת תמונות האירוע</label>
                                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:bg-stone-50 transition-colors relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleGalleryFilesChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                                        <p className="text-stone-900 font-medium">גרור תמונות לכאן או לחץ לבחירה</p>
                                        <p className="text-stone-500 text-sm mt-1">ניתן לבחור מספר רב של תמונות</p>
                                        {galleryFiles.length > 0 && (
                                            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                <Check className="w-4 h-4" />
                                                נבחרו {galleryFiles.length} תמונות
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <span>צור אירוע והתחל עיבוד</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-stone-700">
                                    {uploadProgress}%
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-2">מעבד נתונים...</h3>
                            <p className="text-stone-500 text-lg animate-pulse">{processingStage}</p>

                            <div className="mt-8 max-w-md mx-auto bg-stone-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-500 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-stone-900 mb-4">האירוע נוצר בהצלחה! 🎉</h2>
                            <p className="text-stone-600 mb-8 max-w-md mx-auto">
                                התמונות הועלו, עברו זיהוי פנים והגלריה מוכנה לשיתוף.
                                הנה הקישור הייחודי לאירוע:
                            </p>

                            <div className="bg-stone-100 p-4 rounded-xl flex items-center justify-between max-w-lg mx-auto mb-8 border border-stone-200">
                                <code className="text-amber-700 font-mono text-sm sm:text-base truncate px-2">
                                    {createdEventLink}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(createdEventLink)}
                                    className="bg-white text-stone-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 border border-stone-200 transition-colors"
                                >
                                    העתק
                                </button>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
                                >
                                    חזרה לדשבורד
                                </button>
                                <button
                                    onClick={() => window.open(createdEventLink, '_blank')}
                                    className="px-6 py-3 bg-white text-stone-900 border border-stone-300 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                                >
                                    צפה בגלריה
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateEventPage;
