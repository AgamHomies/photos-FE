import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Camera, LogOut, User, Menu, X } from 'lucide-react';

interface HeaderProps {
    isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
            {/* Logo (Right side in RTL) */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(isAuthenticated ? '/admin' : '/')}
            >
                <img src="/logo.png" alt="Click2Pic" className="h-8" />
            </div>

            {/* Navigation Links (Center - Hidden on mobile/tablet) */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
                {!isAuthenticated && (
                    <>
                        <button
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }, 100);
                            }}
                            className="hover:text-cyan-500 transition-colors"
                        >
                            דף הבית
                        </button>
                        <button
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => {
                                    const section = document.getElementById('how-it-works-section');
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            }}
                            className="hover:text-cyan-500 transition-colors"
                        >
                            איך זה עובד
                        </button>
                        <button
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => {
                                    const section = document.getElementById('benefits-section');
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            }}
                            className="hover:text-cyan-500 transition-colors"
                        >
                            למה לבחור בנו?
                        </button>
                        <button
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => {
                                    const section = document.getElementById('faq-section');
                                    section?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            }}
                            className="hover:text-cyan-500 transition-colors"
                        >
                            שאלות נפוצות
                        </button>
                    </>
                )}
            </nav>

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
                    <div className="hidden lg:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/auth')}
                            className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                        >
                            התחבר
                        </button>
                        <button
                            onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                            className="bg-cyan-500 text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-cyan-600 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            התחלה בחינם
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Menu Button - Hide if authenticated */}
            {!isAuthenticated && (
                <button
                    className="lg:hidden p-2 text-slate-600 hover:text-cyan-600 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            )}

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-lg py-4 px-6 flex flex-col gap-4 lg:hidden">
                    {isAuthenticated ? (
                        <>

                            <button
                                onClick={() => {
                                    navigate('/admin/create-event');
                                    setIsMenuOpen(false);
                                }}
                                className={`text-right py-2 hover:text-cyan-500 transition-colors ${isActive('/admin/create-event') ? 'text-cyan-600 font-bold' : ''}`}
                            >
                                צור אירוע חדש
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsMenuOpen(false);
                                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                }}
                                className="text-right py-2 hover:text-cyan-500 transition-colors"
                            >
                                דף הבית
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsMenuOpen(false);
                                    setTimeout(() => document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                }}
                                className="text-right py-2 hover:text-cyan-500 transition-colors"
                            >
                                איך זה עובד
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsMenuOpen(false);
                                    setTimeout(() => document.getElementById('benefits-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                }}
                                className="text-right py-2 hover:text-cyan-500 transition-colors"
                            >
                                למה לבחור בנו?
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsMenuOpen(false);
                                    setTimeout(() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                }}
                                className="text-right py-2 hover:text-cyan-500 transition-colors"
                            >
                                שאלות נפוצות
                            </button>
                            <div className="border-t border-slate-100 my-2 pt-4 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        navigate('/auth');
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-right py-2 font-medium text-slate-600 hover:text-cyan-600"
                                >
                                    התחבר לחשבון
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/auth', { state: { mode: 'register' } });
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-cyan-500 text-white text-center font-bold py-3 rounded-xl hover:bg-cyan-600 transition-all shadow-sm"
                                >
                                    התחלה בחינם
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
