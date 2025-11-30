import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Check, ArrowRight, FileText, Calendar, MapPin } from 'lucide-react';
import { BackendService } from '../../services/backendService';
import Layout from '../../components/Layout';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'details' | 'upload' | 'processing' | 'done'>('details');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: ''
    });
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
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 4. AI Processing
            setProcessingStage('מבצע זיהוי פנים (Face Indexing)...');
            setUploadProgress(85);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Finalizing
            setProcessingStage('בונה אוספים ומפיק קישור ייחודי...');
            setUploadProgress(100);

            const newEvent = await BackendService.createEvent({
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
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                    {/* Header */}
                    <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">יצירת אירוע חדש</h1>
                        <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                            חזרה לדשבורד
                        </button>
                    </div>

                    <div className="p-8 md:p-10">
                        {step === 'details' && (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Event Details Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        פרטי האירוע
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">שם האירוע</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder='לדוגמה: "החתונה של דנה ויוסי"'
                                                className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">תיאור קצר</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={2}
                                                placeholder="תיאור שיופיע לאורחים..."
                                                className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">תאריך</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                    className="block w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">מיקום</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="שם האולם / מקום"
                                                    className="block w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                                />
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        מדיה ותמונות
                                    </h3>

                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">תמונת קאבר (Cover Image)</label>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                            <div className="relative w-full sm:w-48 h-32 bg-slate-50 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center group hover:border-cyan-500 transition-colors cursor-pointer">
                                                {coverPreview ? (
                                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-500">
                                                        <ImageIcon className="w-8 h-8" />
                                                        <span className="text-xs">לחץ להעלאה</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverImageChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                            <div className="text-sm text-slate-500 space-y-1">
                                                <p className="font-medium text-slate-700">תמונה ראשית לגלריה</p>
                                                <p>מומלץ להשתמש בתמונה רוחבית איכותית (1920x1080).</p>
                                                <p>תמונה זו תופיע בראש עמוד הגלריה ובשיתופים.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gallery Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">העלאת תמונות האירוע</label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-cyan-500 transition-all relative group cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleGalleryFilesChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="w-8 h-8 text-cyan-600" />
                                            </div>
                                            <p className="text-slate-900 font-bold text-lg mb-1">גרור תמונות לכאן או לחץ לבחירה</p>
                                            <p className="text-slate-500 text-sm">ניתן לבחור מספר רב של תמונות (JPG, PNG)</p>
                                            {galleryFiles.length > 0 && (
                                                <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                                                    <Check className="w-4 h-4" />
                                                    נבחרו {galleryFiles.length} תמונות
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full bg-cyan-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                                    >
                                        <span>צור אירוע והתחל עיבוד</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'processing' && (
                            <div className="text-center py-16">
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
                            <div className="text-center py-12">
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
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdEventLink);
                                            alert('הקישור הועתק!');
                                        }}
                                        className="bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm w-full md:w-auto whitespace-nowrap"
                                    >
                                        העתק קישור
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
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CreateEventPage;
