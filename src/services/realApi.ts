import { CONFIG } from '../config';
import { PhotographerProfile, Photo, Event, DashboardStats, PhotographerRegistration } from '../types';

const API_BASE_URL = CONFIG.API_BASE_URL;

// Helper function to get auth token from Supabase
const getAuthToken = async (): Promise<string | null> => {
    // Import supabase client
    const { supabase } = await import('./supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
};

// Helper function for API requests
const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || data.detail || 'Request failed');
    }

    return data;
};

// ============================================
// Authentication API
// ============================================
export const RealAuthAPI = {
    login: async (email: string, password: string): Promise<boolean> => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('current_user_email', email);
        return true;
    },

    register: async (registrationData: PhotographerRegistration): Promise<boolean> => {
        const formData = new FormData();

        // Only send email and termsAccepted for basic registration
        formData.append('email', registrationData.email);
        formData.append('termsAccepted', registrationData.termsAccepted.toString());

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        // User created successfully, but profile not complete yet
        return true;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user_email');
    },

    getCurrentUserEmail: (): string | null => {
        return localStorage.getItem('current_user_email');
    },
};

// ============================================
// Profile API
// ============================================
export const RealProfileAPI = {
    getProfile: async (): Promise<PhotographerProfile | null> => {
        const data = await apiRequest('/auth/me');

        return {
            name: data.profile.name,
            bio: data.profile.short_description,
            profileImageUrl: data.profile.logo_url || 'https://via.placeholder.com/150',
            contactEmail: data.email,
            phone: data.profile.phone,
            instagramUrl: data.profile.instagram_url,
            tiktokUrl: data.profile.tiktok_url,
            facebookUrl: data.profile.facebook_url,
            portfolio: data.profile.portfolio || [],
        };
    },

    getPhotographerProfile: async (email: string): Promise<PhotographerProfile | null> => {
        return RealProfileAPI.getProfile();
    },

    updateProfile: async (updates: Partial<PhotographerProfile>): Promise<void> => {
        console.warn('Profile update not yet implemented in backend');
    },

    completeProfile: async (profileData: Partial<PhotographerRegistration>): Promise<boolean> => {
        const formData = new FormData();

        // Required profile fields
        if (profileData.fullName) formData.append('fullName', profileData.fullName);
        if (profileData.description) formData.append('description', profileData.description);
        if (profileData.address) formData.append('address', profileData.address);
        if (profileData.phone) formData.append('phone', profileData.phone);

        // Optional social media URLs
        if (profileData.instagramUrl) formData.append('instagramUrl', profileData.instagramUrl);
        if (profileData.tiktokUrl) formData.append('tiktokUrl', profileData.tiktokUrl);
        if (profileData.facebookUrl) formData.append('facebookUrl', profileData.facebookUrl);

        // Optional file uploads
        if (profileData.logo) formData.append('logo', profileData.logo);
        if (profileData.portfolio && profileData.portfolio.length > 0) {
            profileData.portfolio.forEach((file) => {
                formData.append('portfolio', file);
            });
        }

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/auth/profile/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Profile completion failed');
        }

        return true;
    },
};

// ============================================
// Events API
// ============================================
export const RealEventAPI = {
    getEvents: async (): Promise<Event[]> => {
        const data = await apiRequest('/events/');

        return data.map((event: any) => ({
            id: event.id,
            photographerId: event.photographer_id,
            name: event.title,
            date: event.event_date.split('T')[0],
            location: event.location || '',
            coverImage: event.cover_image_url || 'https://via.placeholder.com/800x600',
            photoCount: event.image_count || 0,
            guestVisits: event.guest_visits || 0,
            downloads: event.downloads || 0,
            uniqueLink: `${window.location.origin}/gallery/${event.guest_slug}`,
            expiryDate: event.expiry_date || '',
            status: event.is_active ? 'active' : 'expired',
        }));
    },

    getEvent: async (id: string): Promise<Event | undefined> => {
        try {
            const data = await apiRequest(`/events/${id}`);

            return {
                id: data.id,
                photographerId: data.photographer_id,
                name: data.title,
                date: data.event_date.split('T')[0],
                location: data.location || '',
                coverImage: data.cover_image_url || 'https://via.placeholder.com/800x600',
                photoCount: data.image_count || 0,
                guestVisits: data.guest_visits || 0,
                downloads: data.downloads || 0,
                uniqueLink: `${window.location.origin}/gallery/${data.guest_slug}`,
                expiryDate: data.expiry_date || '',
                status: data.is_active ? 'active' : 'expired',
            };
        } catch (error) {
            console.error('Failed to get event:', error);
            return undefined;
        }
    },

    createEvent: async (eventData: Partial<Event>): Promise<Event> => {
        const payload = {
            title: eventData.name || 'New Event',
            description: '',
            event_date: `${eventData.date}T00:00:00`,
            location: eventData.location || '',
            expiry_date: eventData.expiryDate,
        };

        const data = await apiRequest('/events/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return {
            id: data.id,
            photographerId: data.photographer_id,
            name: data.title,
            date: data.event_date.split('T')[0],
            location: data.location || '',
            coverImage: data.cover_image_url || 'https://via.placeholder.com/800x600',
            photoCount: 0,
            guestVisits: 0,
            downloads: 0,
            uniqueLink: `${window.location.origin}/gallery/${data.guest_slug}`,
            expiryDate: data.expiry_date || '',
            status: 'active',
        };
    },

    updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
        const payload: any = {};

        if (updates.name) payload.title = updates.name;
        if (updates.date) payload.event_date = `${updates.date}T00:00:00`;
        if (updates.location) payload.location = updates.location;
        if (updates.expiryDate) payload.expiry_date = updates.expiryDate;

        const data = await apiRequest(`/events/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });

        return {
            id: data.id,
            photographerId: data.photographer_id,
            name: data.title,
            date: data.event_date.split('T')[0],
            location: data.location || '',
            coverImage: data.cover_image_url || 'https://via.placeholder.com/800x600',
            photoCount: data.image_count || 0,
            guestVisits: data.guest_visits || 0,
            downloads: data.downloads || 0,
            uniqueLink: `${window.location.origin}/gallery/${data.guest_slug}`,
            expiryDate: data.expiry_date || '',
            status: data.is_active ? 'active' : 'expired',
        };
    },

    deleteEvent: async (id: string): Promise<void> => {
        await apiRequest(`/events/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// Photos API
// ============================================
export const RealPhotoAPI = {
    getEventPhotos: async (eventId: string): Promise<Photo[]> => {
        try {
            const data = await apiRequest(`/events/${eventId}/images`);

            return data.map((img: any) => ({
                id: img.id,
                url: img.url,
                thumbnailUrl: img.thumbnail_url || img.url,
                title: img.filename || 'Photo',
                date: img.uploaded_at,
                width: img.width,
                height: img.height,
            }));
        } catch (error) {
            console.error('Failed to get event photos:', error);
            return [];
        }
    },

    uploadEventPhotos: async (eventId: string, files: File[]): Promise<void> => {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Upload failed');
        }
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        await apiRequest(`/events/${eventId}/images/${photoId}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// Dashboard API
// ============================================
export const RealDashboardAPI = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const events = await RealEventAPI.getEvents();

        return {
            totalDownloads: events.reduce((acc, e) => acc + e.downloads, 0),
            totalPageVisits: events.reduce((acc, e) => acc + e.guestVisits, 0),
            phoneSaves: Math.floor(events.reduce((acc, e) => acc + e.guestVisits, 0) * 0.4),
            activeEvents: events.filter(e => e.status === 'active').length,
            expiredEvents: events.filter(e => e.status === 'expired').length,
        };
    },
};

// ============================================
// Public Gallery API (for guests)
// ============================================
export const RealGalleryAPI = {
    getEventBySlug: async (slug: string): Promise<Event | undefined> => {
        try {
            const data = await apiRequest(`/public/events/${slug}`);

            return {
                id: data.id,
                photographerId: data.photographer_id,
                name: data.title,
                date: data.event_date.split('T')[0],
                location: data.location || '',
                coverImage: data.cover_image_url || 'https://via.placeholder.com/800x600',
                photoCount: data.image_count || 0,
                guestVisits: data.guest_visits || 0,
                downloads: data.downloads || 0,
                uniqueLink: `${window.location.origin}/gallery/${data.guest_slug}`,
                expiryDate: data.expiry_date || '',
                status: data.is_active ? 'active' : 'expired',
            };
        } catch (error) {
            console.error('Failed to get event by slug:', error);
            return undefined;
        }
    },
};
