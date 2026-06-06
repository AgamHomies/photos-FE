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
        // Supabase v2 processes the #access_token hash asynchronously.
        // It may fire INITIAL_SESSION or SIGNED_IN (depending on timing).
        // We use two strategies in parallel:
        //   1. onAuthStateChange — catches any event that includes a session
        //   2. Polling getSession() every 300ms as a fallback
        // Both are guarded by `handled` so only one runs.

        let handled = false;

        const processSession = async (session: any) => {
            if (handled) return;
            handled = true;

            try {
                setStatus('loading');
                setMessage('מסנכרן נתוני משתמש...');

                const pendingType = sessionStorage.getItem('pending_user_type') as 'photographer' | 'individual' | null;
                sessionStorage.removeItem('pending_user_type');
                if (pendingType) localStorage.setItem('active_mode', pendingType);

                const syncResponse = await RealAuthAPI.syncUser(pendingType ?? undefined);

                setStatus('success');
                setMessage('אימות הצליח! מעביר לדף הראשי...');

                const isComplete = syncResponse?.data?.profileComplete;
                const dest = (isComplete || pendingType === 'individual') ? '/admin' : '/complete-profile';
                setTimeout(() => navigate(dest), 1500);
            } catch (syncError: any) {
                console.error('Sync error:', syncError);
                setStatus('error');
                setMessage('שגיאה בסנכרון נתונים: ' + (syncError.message || 'Unknown error'));
                setTimeout(() => navigate('/auth'), 3000);
            }
        };

        // Strategy 1: listen to ANY auth state change that carries a session.
        // Supabase v2 may fire INITIAL_SESSION, SIGNED_IN, or TOKEN_REFRESHED.
        const { data: { subscription } } = supabaseAuthService.onAuthStateChangeRaw((event, session) => {
            if (session && !handled) {
                processSession(session);
            }
        });

        // Strategy 2: poll getSession() every 300 ms for up to 10 seconds.
        // Catches cases where onAuthStateChange fires before our listener registers.
        let attempts = 0;
        const poll = setInterval(async () => {
            if (handled) { clearInterval(poll); return; }
            attempts++;
            try {
                const { session } = await supabaseAuthService.getSession();
                if (session) {
                    clearInterval(poll);
                    processSession(session);
                    return;
                }
            } catch (_) { /* ignore, keep polling */ }

            if (attempts >= 33) { // ~10 seconds
                clearInterval(poll);
                if (!handled) {
                    handled = true;
                    setStatus('error');
                    setMessage('לא נמצא סשן פעיל. נסה שוב.');
                    setTimeout(() => navigate('/auth'), 3000);
                }
            }
        }, 300);

        return () => {
            subscription.unsubscribe();
            clearInterval(poll);
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
