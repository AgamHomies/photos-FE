import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { supabaseAuthService } from '../../services/supabaseAuthService';
import { RealAuthAPI } from '../../services/realApi';
import { Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('מעבד אימות...');

    useEffect(() => {
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

        const handleCallback = async () => {
            // ── Strategy A: Implicit flow — parse #access_token from hash directly ──
            // Supabase dashboard is set to "Implicit", so tokens arrive in the URL hash.
            // We parse them manually and call setSession() — most reliable approach.
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
                const params = new URLSearchParams(hash.substring(1)); // strip leading '#'
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    try {
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (data?.session) {
                            processSession(data.session);
                            return;
                        }
                        if (error) console.warn('setSession error:', error.message);
                    } catch (e) {
                        console.warn('setSession threw:', e);
                    }
                }
            }

            // ── Strategy B: PKCE flow — check if session already exists ──
            // Handles the case where Supabase auto-processed a ?code= param.
            const { session } = await supabaseAuthService.getSession();
            if (session) {
                processSession(session);
                return;
            }

            // ── Strategy C: Wait for onAuthStateChange ──
            // Supabase is still processing the hash asynchronously — wait for it.
            const { data: { subscription } } = supabaseAuthService.onAuthStateChangeRaw((event, sess) => {
                if (sess && !handled) {
                    subscription.unsubscribe();
                    processSession(sess);
                }
            });

            // ── Strategy D: Polling fallback — check getSession every 400ms up to 8s ──
            let attempts = 0;
            const poll = setInterval(async () => {
                if (handled) { clearInterval(poll); return; }
                attempts++;
                try {
                    const { session: s } = await supabaseAuthService.getSession();
                    if (s) { clearInterval(poll); processSession(s); return; }
                } catch (_) {}

                if (attempts >= 20) { // 8 seconds
                    clearInterval(poll);
                    subscription.unsubscribe();
                    if (!handled) {
                        handled = true;
                        setStatus('error');
                        setMessage('לא נמצא סשן פעיל. נסה שוב.');
                        setTimeout(() => navigate('/auth'), 3000);
                    }
                }
            }, 400);
        };

        handleCallback();
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
