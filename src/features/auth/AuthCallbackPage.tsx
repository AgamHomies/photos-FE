import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { RealAuthAPI } from '../../services/realApi';
import { Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('מעבד אימות...');

    useEffect(() => {
        // Supabase processes the #access_token hash asynchronously and fires
        // onAuthStateChange(SIGNED_IN) when done. Calling getSession() immediately
        // races with this processing and can return null on first load.
        // The correct approach: listen for SIGNED_IN, then proceed.

        let handled = false; // ensure we only process once

        const processSession = async (session: any) => {
            if (handled) return;
            handled = true;
            try {
                setStatus('loading');
                setMessage('מסנכרן נתוני משתמש...');

                // Read the user type chosen before the OAuth redirect
                const pendingType = sessionStorage.getItem('pending_user_type') as 'photographer' | 'individual' | null;
                sessionStorage.removeItem('pending_user_type');
                if (pendingType) localStorage.setItem('active_mode', pendingType);

                const syncResponse = await RealAuthAPI.syncUser(pendingType ?? undefined);

                setStatus('success');
                setMessage('אימות הצליח! מעביר לדף הראשי...');

                const isComplete = syncResponse?.data?.profileComplete;
                // Individual users skip profile completion — it's photographer-only
                const dest = (isComplete || pendingType === 'individual') ? '/admin' : '/complete-profile';
                setTimeout(() => navigate(dest), 1500);
            } catch (syncError: any) {
                console.error('Sync error:', syncError);
                setStatus('error');
                setMessage('שגיאה בסנכרון נתונים: ' + (syncError.message || 'Unknown error'));
                setTimeout(() => navigate('/auth'), 3000);
            }
        };

        // First, check if a session already exists (e.g. page refresh scenario)
        supabaseAuthService.getSession().then(({ session, error }) => {
            if (error) {
                setStatus('error');
                setMessage('שגיאה באימות: ' + error.message);
                setTimeout(() => navigate('/auth'), 3000);
                return;
            }
            if (session) {
                // Session already available — process immediately
                processSession(session);
            }
            // If no session yet, the onAuthStateChange listener below will handle it
        });

        // Listen for Supabase to finish processing the hash fragment
        const { data: { subscription } } = supabaseAuthService.onAuthStateChangeRaw((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                processSession(session);
            } else if (event === 'SIGNED_OUT') {
                setStatus('error');
                setMessage('לא נמצא סשן פעיל');
                setTimeout(() => navigate('/auth'), 3000);
            }
        });

        // Safety timeout — if nothing happens in 8s, show error
        const timeout = setTimeout(() => {
            setStatus(prev => {
                if (prev === 'loading') {
                    setTimeout(() => navigate('/auth'), 3000);
                    return 'error';
                }
                return prev;
            });
            setMessage(prev => prev === 'מעבד אימות...' ? 'תם הזמן המוקצב לאימות' : prev);
        }, 8000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [navigate]);

    return (
        <Layout showFooter={false}>
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
                    <div className="mx-auto h-16 w-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 text-cyan-500">
                        <Camera className="h-8 w-8" />
                    </div>

                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 text-cyan-500 animate-spin" />
                            <p className="text-slate-600 font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <XCircle className="h-8 w-8" />
                            </div>
                            <p className="text-red-600 font-medium">{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AuthCallbackPage;
