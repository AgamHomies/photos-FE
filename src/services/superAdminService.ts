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
    total_likes: number; // Added
    active_events: number;
    draft_events: number;

    // Package Stats
    stats_basic: PackageTypeStats;
    stats_premium: PackageTypeStats;
    stats_gold: PackageTypeStats;

    avg_images_per_event: number;
    avg_views_per_event: number;
    avg_downloads_per_event: number;
    avg_contact_saves_per_event: number;
    avg_social_traffic_per_photographer: number;
    avg_events_per_photographer: number;
    avg_likes_per_event: number; // Added

    max_images_per_event: number;
    max_views_per_event: number;
    max_downloads_per_event: number;
    max_contact_saves_per_event: number;
    max_social_traffic_per_photographer: number;
    max_events_per_photographer: number;
    max_likes_per_event: number; // Added

    download_rate_percent: number;
    contact_save_rate_percent: number;
}

export interface PackageTypeStats {
    total: number;
    active: number;
    avg_per_photographer: number;
    max_per_photographer: number;
}

export interface PhotographerPackageStats {
    total: number;
    active: number;
}

export interface PhotographerStats {
    id: number;
    email: string;
    name: string | null;
    created_at: string;
    logo_url: string | null;
    total_events: number;
    total_images: number;
    total_downloads: number;
    total_contact_saves: number;
    total_views: number;
    total_social_traffic: number;
    total_likes: number;
    active_events: number;
    user_type?: string;  // 'photographer' or 'individual'

    // Package Stats
    stats_basic?: PhotographerPackageStats;
    stats_premium?: PhotographerPackageStats;
    stats_gold?: PhotographerPackageStats;
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
    website_url: string | null;
    instagram_url: string | null;
    tiktok_url: string | null;
    facebook_url: string | null;
    stats: {
        total_events: number;
        total_images: number;
        total_downloads: number;
        total_contact_saves: number;
        total_views: number;
        active_events: number;
        draft_events: number;
        total_social_traffic: number;
        total_likes: number;
        // Package Stats
        stats_basic?: PhotographerPackageStats;
        stats_premium?: PhotographerPackageStats;
        stats_gold?: PhotographerPackageStats;
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
    package_type?: string;
}

export interface AllEventItem {
    id: number;
    name: string;
    slug: string;
    package_type: string;
    created_at: string;
    expiry_date: string;
    is_expired: boolean;
    photographer_id: number | null;
    photographer_name: string | null;
    created_as: string;
    leads_count: number;
    status: string;
    is_uploading: boolean;
}

export interface LeadItem {
    id: number;
    event_id: number;
    event_name: string;
    event_slug: string;
    photographer_id: number | null;
    photographer_name: string | null;
    event_created_as: string;
    name: string;
    phone: string;
    is_contacted: boolean;
    created_at: string;
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
     * Check if token is expired
     */
    private isTokenExpired(): boolean {
        try {
            const token = this.getToken();
            // Decode JWT payload (middle part)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= expirationTime;
        } catch (error) {
            return true; // If we can't decode, assume expired
        }
    }

    /**
     * Get authorization header
     */
    private getAuthHeader(): HeadersInit {
        // Check if token is expired before making request
        if (this.isTokenExpired()) {
            this.logout();
            throw new Error('Session expired. Please login again.');
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`,
        };
    }

    /**
     * Handle API response and check for authentication errors
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 401) {
            // Token is invalid or expired
            this.logout();
            window.location.href = '/super-admin/login';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get platform overview statistics
     */
    async getPlatformStats(): Promise<PlatformStats> {
        const response = await fetch(`${API_BASE_URL}/super-admin/stats/overview`, {
            headers: this.getAuthHeader()
        });

        return this.handleResponse<PlatformStats>(response);
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

        return this.handleResponse<PhotographerStats[]>(response);
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

        return this.handleResponse<PhotographerDetail>(response);
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

        return this.handleResponse<EventSummary[]>(response);
    }
    async getAllEvents(): Promise<AllEventItem[]> {
        const response = await fetch(`${API_BASE_URL}/super-admin/events`, {
            headers: this.getAuthHeader()
        });
        return this.handleResponse<AllEventItem[]>(response);
    }

    async deleteEvent(eventId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/super-admin/events/${eventId}`, {
            method: 'DELETE',
            headers: this.getAuthHeader()
        });
        await this.handleResponse<any>(response);
    }

    async deleteExpiredEvents(): Promise<{ deleted_count: number }> {
        const response = await fetch(`${API_BASE_URL}/super-admin/events/expired`, {
            method: 'DELETE',
            headers: this.getAuthHeader()
        });
        return this.handleResponse<{ deleted_count: number }>(response);
    }

    /**
     * Export all photographers to CSV
     */
    async getAllLeads(): Promise<LeadItem[]> {
        const response = await fetch(`${API_BASE_URL}/super-admin/leads`, {
            headers: this.getAuthHeader()
        });
        return this.handleResponse<LeadItem[]>(response);
    }

    async exportPhotographersCsv(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/super-admin/export/photographers/csv`, {
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // Trigger file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photographers_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

export default new SuperAdminService();
