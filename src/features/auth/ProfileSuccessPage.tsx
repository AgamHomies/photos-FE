import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check, Zap, Users, TrendingUp, Rocket, Shield, Cloud, Headphones, ArrowRight, User, LogOut } from 'lucide-react';

const ProfileSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden" dir="rtl">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center relative z-10">
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
            <main className="flex-grow flex items-center justify-center py-12 px-4 relative z-10">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 text-center animate-fade-in-up">
                    
                    {/* Success Icon Animation */}
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                            <Check className="w-12 h-12 text-cyan-500 animate-check-bounce" strokeWidth={3} />
                        </div>
                        {/* Decorative dots */}
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute bottom-2 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 -left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        הפרטים נשמרו בהצלחה!
                    </h1>
                    
                    <div className="flex justify-center gap-2 text-2xl mb-6">
                        <span>✨</span>
                        <span>📷</span>
                        <span>🎉</span>
                    </div>

                    <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                        הפרופיל שלך מוכן! מעכשיו כל תמונה שתעלה למערכת תקבל מיתוג אוטומטי, והאורחים ייהנו מחוויה אישית ומהירה.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors">
                            <Zap className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-slate-700">מיתוג מהיר</span>
                        </div>
                        <div className="bg-green-50/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
                            <Users className="w-6 h-6 text-green-500" />
                            <span className="font-bold text-slate-700">חוויית לקוח</span>
                        </div>
                        <div className="bg-purple-50/50 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-purple-50 transition-colors">
                            <TrendingUp className="w-6 h-6 text-purple-500" />
                            <span className="font-bold text-slate-700">צמיחה עסקית</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-cyan-500 text-white text-lg font-bold py-4 rounded-xl hover:bg-cyan-600 transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 group"
                        >
                            <span>התחל להשתמש במערכת</span>
                            <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                            <span>או חזור לדף הבית</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="border-t border-slate-100 mt-10 pt-6">
                        <div className="flex justify-center gap-6 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-green-500" />
                                <span>מאובטח</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Cloud className="w-3 h-3 text-blue-500" />
                                <span>גיבוי אוטומטי</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Headphones className="w-3 h-3 text-purple-500" />
                                <span>תמיכה 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                @keyframes check-bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-check-bounce {
                    animation: check-bounce 2s infinite ease-in-out;
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ProfileSuccessPage;
