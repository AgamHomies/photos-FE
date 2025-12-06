import React, { useState } from 'react';
import {
    Headset,
    Mail,
    Phone,
    Clock,
    Youtube,
    Linkedin,
    Instagram,
    Facebook,
    Send
} from 'lucide-react';
import Layout from '../../components/Layout';
import { Toast } from '../../components';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerToast('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.');
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center">
                            <Headset className="w-10 h-10 text-cyan-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">צלם יקר!</h1>
                    <p className="text-xl text-slate-600">השאר פרטים ונחזור אליך בהקדם.</p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Contact Info) - Actually Right in RTL */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Details Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">פרטי יצירת קשר</h3>

                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-blue-500 rounded-xl p-3 text-white">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">אימייל</p>
                                        <p className="font-bold text-slate-900 dir-ltr text-right">support@click2pic.io</p>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-green-500 rounded-xl p-3 text-white">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">טלפון</p>
                                        <p className="font-bold text-slate-900 dir-ltr text-right">050-000-0000</p>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-purple-500 rounded-xl p-3 text-white">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">שעות פעילות</p>
                                        <p className="font-bold text-slate-900">א'-ה' 09:00-18:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">עקבו אחרינו</h3>
                            <div className="flex justify-center gap-4">
                                <a href="#" className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Youtube className="w-6 h-6" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Linkedin className="w-6 h-6" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Instagram className="w-6 h-6" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Facebook className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Form) - Actually Left in RTL */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">שלח לנו הודעה</h2>
                                <p className="text-slate-500">מלא את הפרטים ונחזור אליך תוך 24 שעות</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        שם מלא <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="הכנס את שמך המלא"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            אימייל <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 text-left"
                                            dir="ltr"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            טלפון (אופציונלי)
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="050-0000000"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 text-left"
                                            dir="ltr"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        נושא הפנייה <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="">בחר נושא</option>
                                        <option value="support">תמיכה טכנית</option>
                                        <option value="sales">מכירות</option>
                                        <option value="billing">חיובים ותשלומים</option>
                                        <option value="other">אחר</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        הודעה שלך <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="כתוב כאן את ההודעה שלך..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    שלח הודעה
                                </button>
                            </form>
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

export default ContactPage;
