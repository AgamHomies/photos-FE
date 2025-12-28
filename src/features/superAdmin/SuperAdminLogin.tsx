import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import SuperAdminService from '../../services/superAdminService';

const SuperAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await SuperAdminService.login(username, password);
            navigate('/super-admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE3] flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-[#C4A882] rounded-full mb-4">
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#8B7355] mb-2">Super Admin</h1>
                    <p className="text-[#8B7355]/70">פאנל ניהול מערכת</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#F0EBE3]">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-2">
                                שם משתמש
                            </label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 border border-[#F0EBE3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:border-transparent text-[#8B7355]"
                                    placeholder="zinoAdmin"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#8B7355] mb-2">
                                סיסמה
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7355]/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 border border-[#F0EBE3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:border-transparent text-[#8B7355]"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#C4A882] text-white py-3 rounded-xl font-bold hover:bg-[#B39872] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'מתחבר...' : 'התחבר'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-[#8B7355]/60">
                    <p>© 2024 Click2Pic - Super Admin Panel</p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
