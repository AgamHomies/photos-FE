/**
 * Super Admin API Service
 * 
 * Handles API calls for super admin dashboard.
 * Uses backend authentication (no Supabase dependency).
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export interface PlatformStats {
    total_photographers: number;
    total_events: number;
    total_images: number;
    total_downloads: number;
    total_contact_saves: number;
    total_views: number;
    total_social_traffic: number;
    active_events: number;
    draft_events: number;
}

export interface PhotographerStats {
    id: number;
    email: string;
    name: string | null;
    created_at: string;
    total_events: number;
    total_images: number;
    total_downloads: number;
    total_contact_saves: number;
    total_views: number;
    active_events: number;
}

export interface PhotographerDetail {
    id: number;
    email: string;
    created_at: string;
    name: string | null;
    short_description: string | null;
    contact_email: string | null;
    phone: string | null;
    address: string | null;
    logo_url: string | null;
    stats: {
        total_events: number;
        total_images: number;
        total_downloads: number;
        total_contact_saves: number;
        total_views: number;
        active_events: number;
        draft_events: number;
        total_social_traffic: number;
    };
}

export interface EventSummary {
    id: number;
    name: string;
    slug: string;
    status: string;
    created_at: string;
    image_count: number;
    downloads: number;
    contact_saves: number;
    views: number;
}

class SuperAdminService {
    private token: string | null = null;

    /**
     * Login as super admin using backend authentication
     */
    async login(username: string, password: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/super-admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        this.token = data.access_token;

        // Store token in localStorage
        localStorage.setItem('super_admin_token', data.access_token);
    }

    /**
     * Logout super admin
     */
    async logout(): Promise<void> {
        this.token = null;
        localStorage.removeItem('super_admin_token');
    }

    /**
     * Get current token
     */
    private getToken(): string {
        if (!this.token) {
            this.token = localStorage.getItem('super_admin_token');
        }
        if (!this.token) {
            throw new Error('Not authenticated');
        }
        return this.token;
    }

    /**
     * Get authorization header
     */
    private getAuthHeader(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`,
        };
    }

    /**
     * Get platform overview statistics
     */
    async getPlatformStats(): Promise<PlatformStats> {
        const response = await fetch(`${API_BASE_URL}/super-admin/stats/overview`, {
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch platform stats');
        }

        return response.json();
    }

    /**
     * Get all photographers with statistics
     */
    async getPhotographers(search?: string): Promise<PhotographerStats[]> {
        const url = search
            ? `${API_BASE_URL}/super-admin/photographers?search=${encodeURIComponent(search)}`
            : `${API_BASE_URL}/super-admin/photographers`;

        const response = await fetch(url, {
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch photographers');
        }

        return response.json();
    }

    /**
     * Get detailed information about a photographer
     */
    async getPhotographerDetail(photographerId: number): Promise<PhotographerDetail> {
        const response = await fetch(
            `${API_BASE_URL}/super-admin/photographers/${photographerId}`,
            {
                headers: this.getAuthHeader()
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch photographer details');
        }

        return response.json();
    }

    /**
     * Get all events for a photographer
     */
    async getPhotographerEvents(photographerId: number): Promise<EventSummary[]> {
        const response = await fetch(
            `${API_BASE_URL}/super-admin/photographers/${photographerId}/events`,
            {
                headers: this.getAuthHeader()
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch photographer events');
        }

        return response.json();
    }
}

export default new SuperAdminService();
