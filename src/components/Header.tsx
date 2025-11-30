import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Camera, LogOut, User } from 'lucide-react';

interface HeaderProps {
    isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
            {/* User Profile / Auth Buttons (Left side in RTL) */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button className="flex items-center gap-2 focus:outline-none">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 border-2 border-white shadow-sm overflow-hidden">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-slate-700">{user?.user_metadata?.full_name || 'משתמש'}</span>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                                <button
                                    onClick={() => navigate('/admin/settings')}
                                    className="w-full text-right px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-cyan-600 transition-colors"
                                >
                                    הגדרות פרופיל
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-right px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    התנתק
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            התחבר
                        </button>
                        <button
                            onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                            className="bg-cyan-500 text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-cyan-600 transition-all shadow-sm hover:shadow-md"
                        >
                            התחלה בחינם
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Links (Center - Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 absolute left-1/2 transform -translate-x-1/2">
                {isAuthenticated ? (
                    <>
                        <button
                            onClick={() => navigate('/admin')}
                            className={`hover:text-cyan-500 transition-colors ${isActive('/admin') ? 'text-cyan-600 font-bold' : ''}`}
                        >
                            דשבורד
                        </button>
                        <button
                            onClick={() => navigate('/admin/events')}
                            className={`hover:text-cyan-500 transition-colors ${isActive('/admin/events') ? 'text-cyan-600 font-bold' : ''}`}
                        >
                            האירועים שלך
                        </button>
                        <button
                            onClick={() => navigate('/admin/create-event')}
                            className={`hover:text-cyan-500 transition-colors ${isActive('/admin/create-event') ? 'text-cyan-600 font-bold' : ''}`}
                        >
                            צור אירוע חדש
                        </button>
                        <button
                            onClick={() => navigate('/help')}
                            className={`hover:text-cyan-500 transition-colors ${isActive('/help') ? 'text-cyan-600 font-bold' : ''}`}
                        >
                            תמיכה
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('/')} className="hover:text-cyan-500 transition-colors">דף הבית</button>
                        <button onClick={() => navigate('/contact')} className="hover:text-cyan-500 transition-colors">אודות</button>
                        <a href="#" className="hover:text-cyan-500 transition-colors">תמחור</a>
                        <button onClick={() => navigate('/contact')} className="hover:text-cyan-500 transition-colors">צור קשר</button>
                    </>
                )}
            </nav>

            {/* Logo (Right side in RTL) */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(isAuthenticated ? '/admin' : '/')}
            >
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Click<span className="text-cyan-500">2</span>Pic</h1>
            </div>
        </header>
    );
};

export default Header;
