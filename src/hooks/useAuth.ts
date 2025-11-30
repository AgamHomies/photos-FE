import { useState, useEffect } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { MockS3Service } from '../services/mockS3';
import { CONFIG } from '../config';
import { User } from '@supabase/supabase-js';

const USE_MOCK = CONFIG.USE_MOCK;

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            if (USE_MOCK) {
                const userEmail = MockS3Service.getCurrentUserEmail();
                if (userEmail) {
                    setIsAuthenticated(true);
                    // Create a mock user object
                    setUser({
                        id: 'mock-user-id',
                        app_metadata: {},
                        user_metadata: {
                            full_name: 'Mock User',
                            avatar_url: null
                        },
                        aud: 'authenticated',
                        created_at: new Date().toISOString()
                    } as User);
                }
            } else {
                const { session } = await supabaseAuthService.getSession();
                if (session) {
                    setIsAuthenticated(true);
                    setUser(session.user);
                }
            }
            setIsLoading(false);
        };

        checkSession();

        // Listen to auth state changes (Supabase only)
        if (!USE_MOCK) {
            const { data: { subscription } } = supabaseAuthService.onAuthStateChange((session) => {
                setIsAuthenticated(!!session);
                setUser(session?.user || null);
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);

    const login = async (password: string, email?: string): Promise<boolean> => {
        // This method is kept for backward compatibility but not used with Supabase
        // Supabase login is handled directly in AuthPage
        if (USE_MOCK && email) {
            try {
                const success = await MockS3Service.login(email, password);
                if (success) {
                    setIsAuthenticated(true);
                    setUser({
                        id: 'mock-user-id',
                        app_metadata: {},
                        user_metadata: {
                            full_name: 'Mock User',
                            avatar_url: null
                        },
                        aud: 'authenticated',
                        created_at: new Date().toISOString()
                    } as User);
                    return true;
                }
            } catch (error) {
                console.error("Login failed", error);
                throw error;
            }
        }
        return false;
    };

    const logout = async () => {
        if (USE_MOCK) {
            MockS3Service.logout();
        } else {
            await supabaseAuthService.signOut();
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    return { isAuthenticated, isLoading, login, logout, user };
};
