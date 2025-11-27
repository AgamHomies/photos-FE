import { useState, useEffect } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { MockS3Service } from '../services/mockS3';
import { CONFIG } from '../config';

const USE_MOCK = CONFIG.USE_MOCK;

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            if (USE_MOCK) {
                const userEmail = MockS3Service.getCurrentUserEmail();
                if (userEmail) {
                    setIsAuthenticated(true);
                }
            } else {
                const { session } = await supabaseAuthService.getSession();
                if (session) {
                    setIsAuthenticated(true);
                }
            }
            setIsLoading(false);
        };

        checkSession();

        // Listen to auth state changes (Supabase only)
        if (!USE_MOCK) {
            const { data: { subscription } } = supabaseAuthService.onAuthStateChange((session) => {
                setIsAuthenticated(!!session);
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
    };

    return { isAuthenticated, isLoading: isLoading, login, logout };
};
