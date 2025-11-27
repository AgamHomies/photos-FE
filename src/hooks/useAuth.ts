import { useState, useEffect } from 'react';
import { MockS3Service } from '../services/mockS3';
import { RealAuthAPI } from '../services/realApi';
import { CONFIG } from '../config';

const USE_MOCK = CONFIG.USE_MOCK;

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for existing session on mount
        const userEmail = USE_MOCK
            ? MockS3Service.getCurrentUserEmail()
            : RealAuthAPI.getCurrentUserEmail();

        if (userEmail) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (password: string, email?: string): Promise<boolean> => {
        if (!email) return false;

        try {
            const success = USE_MOCK
                ? await MockS3Service.login(email, password)
                : await RealAuthAPI.login(email, password);

            if (success) {
                setIsAuthenticated(true);
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error; // Re-throw to allow error handling in components
        }
        return false;
    };

    const logout = () => {
        if (USE_MOCK) {
            MockS3Service.logout();
        } else {
            RealAuthAPI.logout();
        }
        setIsAuthenticated(false);
    };

    return { isAuthenticated, isLoading: isLoading, login, logout };
};
