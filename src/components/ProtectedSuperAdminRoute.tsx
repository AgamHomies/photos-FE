import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Protected route wrapper for Super Admin pages
 * Checks for super_admin_token in localStorage
 * Redirects to login if not authenticated
 */
const ProtectedSuperAdminRoute: React.FC = () => {
    const token = localStorage.getItem('super_admin_token');

    if (!token) {
        // No token found, redirect to login
        return <Navigate to="/super-admin/login" replace />;
    }

    // Token exists, render the protected route
    return <Outlet />;
};

export default ProtectedSuperAdminRoute;
