import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { Camera } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('מעבד אימות...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from Supabase
                const { session, error } = await supabaseAuthService.getSession();

                if (error) {
                    setStatus('error');
                    setMessage('שגיאה באימות: ' + error.message);
                    setTimeout(() => navigate('/auth'), 3000);
                    return;
                }

                if (session) {
                    setStatus('success');
                    setMessage('אימות הצליח! מעביר לדף הראשי...');
                    
                    // Check if user exists in backend, if not, redirect to complete profile
                    // For now, just redirect to admin
                    setTimeout(() => navigate('/admin'), 1500);
                } else {
                    setStatus('error');
                    setMessage('לא נמצא סשן פעיל');
                    setTimeout(() => navigate('/auth'), 3000);
                }
            } catch (error: any) {
                console.error('Callback error:', error);
                setStatus('error');
                setMessage('אירעה שגיאה בלתי צפויה');
                setTimeout(() => navigate('/auth'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl text-center">
                <div className="mx-auto h-16 w-16 bg-stone-900 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-amber-400" />
                </div>
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                        <p className="text-stone-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-stone-900 font-medium">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallbackPage;
