import { useState, useEffect } from 'react';
import { MockS3Service } from '../services/mockS3';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for existing session on mount
        const userEmail = MockS3Service.getCurrentUserEmail();
        if (userEmail) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (password: string, email?: string): Promise<boolean> => {
        if (!email) return false; // We need email now
        try {
            const success = await MockS3Service.login(email, password);
            if (success) {
                setIsAuthenticated(true);
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
        }
        return false;
    };

    const logout = () => {
        MockS3Service.logout();
        setIsAuthenticated(false);
    };

    return { isAuthenticated, isLoading, login, logout };
};
