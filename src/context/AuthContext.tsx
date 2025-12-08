import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { MockS3Service } from '../services/mockS3';
import { CONFIG } from '../config';
import { User } from '@supabase/supabase-js';

const USE_MOCK = CONFIG.USE_MOCK;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (password: string, email?: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            if (USE_MOCK) {
                const userEmail = MockS3Service.getCurrentUserEmail();
                if (userEmail) {
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
