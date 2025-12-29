import React, { useState, useEffect } from 'react';
import {
    Users,
    Mail,
    Phone,
    Calendar,
    Download,
    Eye,
    Save,
    Image as ImageIcon,
    Search,
    ArrowLeft,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { BackendService } from '../../services/backendService';

interface PhotographerData {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    created_at: string;
    event_count: number;
    total_downloads: number;
    total_page_visits: number;
    total_phone_saves: number;
}

const SuperAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [photographers, setPhotographers] = useState<PhotographerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check authorization first
                const profile = await BackendService.getProfile();
                if (!profile || profile.contactEmail !== 'admin@click2pic.com') {
                    setIsAuthorized(false);
                    setLoading(false);
                    return;
                }

                setIsAuthorized(true);
                const data = await BackendService.getAllPhotographers();
                setPhotographers(data);
            } catch (error) {
                console.error('Failed to fetch photographers:', error);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPhotographers = photographers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAuthorized && !loading) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">טוען נתוני מערכת...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">ניהול מערכת (Super Admin)</h1>
                                <p className="text-slate-500 mt-1">צפייה וניהול כלל הצלמים הרשומים במערכת</p>
                            </div>
                        </div>

                        <div className="relative max-w-md w-full">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="חיפוש לפי שם או אימייל..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-medium">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>סה"כ צלמים</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{photographers.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-medium">
                                <ImageIcon className="w-4 h-4 text-purple-500" />
                                <span>סה"כ אירועים</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                {photographers.reduce((acc, p) => acc + p.event_count, 0)}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-medium">
                                <Eye className="w-4 h-4 text-cyan-500" />
                                <span>סה"כ צפיות</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                {photographers.reduce((acc, p) => acc + p.total_page_visits, 0)}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-medium">
                                <Download className="w-4 h-4 text-green-500" />
                                <span>סה"כ הורדות</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                {photographers.reduce((acc, p) => acc + p.total_downloads, 0)}
                            </div>
                        </div>
                    </div>

                    {/* Photographers Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600">צלם</th>
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600">פרטי קשר</th>
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600">תאריך הצטרפות</th>
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center">אירועים</th>
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center">סטטיסטיקה</th>
                                        <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPhotographers.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{p.name}</div>
                                                        <div className="text-xs text-slate-400">ID: {p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        {p.email}
                                                    </div>
                                                    {p.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                            {p.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(p.created_at).toLocaleDateString('he-IL')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-100">
                                                    {p.event_count} אירועים
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center gap-1" title="צפיות">
                                                        <Eye className="w-4 h-4 text-cyan-500" />
                                                        <span className="text-xs font-bold text-slate-700">{p.total_page_visits}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1" title="הורדות">
                                                        <Download className="w-4 h-4 text-green-500" />
                                                        <span className="text-xs font-bold text-slate-700">{p.total_downloads}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1" title="שמירות טלפון">
                                                        <Save className="w-4 h-4 text-amber-500" />
                                                        <span className="text-xs font-bold text-slate-700">{p.total_phone_saves}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <button
                                                    onClick={() => window.open(`mailto:${p.email}`)}
                                                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-cyan-600 border border-transparent hover:border-slate-200"
                                                    title="צור קשר"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredPhotographers.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-bold">לא נמצאו צלמים</h3>
                                <p className="text-slate-500 text-sm">נסה לשנות את מונחי החיפוש</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SuperAdminPage;
