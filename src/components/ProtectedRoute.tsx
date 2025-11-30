import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BackendService } from '../services/backendService';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [profileCheckLoading, setProfileCheckLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(true);

    useEffect(() => {
        const checkProfileCompletion = async () => {
            if (!isAuthenticated || isLoading) {
                setProfileCheckLoading(false);
                return;
            }

            // Don't check profile if we're already on the profile completion page
            if (location.pathname === '/complete-profile') {
                setProfileCheckLoading(false);
                return;
            }

            try {
                const profile = await BackendService.getProfile();
                // Check if profile has real data (not just temporary values)
                const hasCompleteProfile = profile &&
                    profile.name &&
                    profile.phone &&
                    profile.bio;
                setProfileComplete(!!hasCompleteProfile);
            } catch (error) {
                // If profile fetch fails, assume profile is incomplete
                console.log('Profile not found or incomplete:', error);
                setProfileComplete(false);
            } finally {
                setProfileCheckLoading(false);
            }
        };

        checkProfileCompletion();
    }, [isAuthenticated, isLoading, location.pathname]);

    if (isLoading || profileCheckLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // Redirect to profile completion if profile is incomplete
    // But only if we're not already on the profile completion page
    // And if the user hasn't explicitly skipped it for this session
    const hasSkipped = sessionStorage.getItem('skipProfileCompletion') === 'true';
    if (!profileComplete && location.pathname !== '/complete-profile' && !hasSkipped) {
        return <Navigate to="/complete-profile" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
