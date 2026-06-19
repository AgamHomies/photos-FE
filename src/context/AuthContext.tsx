import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { User } from '@supabase/supabase-js';

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
            try {
                const { session, error } = await supabaseAuthService.getSession();
                if (error) throw error;
                if (session) {
                    // Validate the stored token against the server. If it was
                    // issued by a different/older project it returns 401, and we
                    // must not treat the user as authenticated.
                    const { user: verifiedUser, error: userError } = await supabaseAuthService.getCurrentUser();
                    if (userError || !verifiedUser) throw userError || new Error('Invalid session');
                    setIsAuthenticated(true);
                    setUser(verifiedUser);
                }
            } catch (e) {
                // A stored session token rejected by Supabase (e.g. 401 from
                // /auth/v1/user when the token is stale or belongs to another
                // project) would otherwise leave the app stuck. Purge it so the
                // login screen works cleanly.
                try { await supabaseAuthService.signOut(); } catch { /* ignore */ }
                setIsAuthenticated(false);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkSession();

        const { data: { subscription } } = supabaseAuthService.onAuthStateChange((session) => {
            setIsAuthenticated(!!session);
            setUser(session?.user || null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (password: string, email?: string): Promise<boolean> => {
        return false;
    };

    const logout = async () => {
        await supabaseAuthService.signOut();
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
