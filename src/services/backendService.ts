/**
 * Unified Backend Service
 *
 * Single entry point for all backend calls.
 * Import this everywhere instead of realApi directly.
 */

import { CONFIG } from '../config';
import {
    RealAuthAPI,
    RealProfileAPI,
    RealEventAPI,
    RealPhotoAPI,
    RealDashboardAPI,
    RealGalleryAPI,
    RealPaymentAPI,
} from './realApi';
import { PhotographerRegistration, PhotographerProfile, Photo, Event, DashboardStats } from '../types';
import { supabase } from './supabaseClient';

/**
 * Gets a valid (auto-refreshed) Supabase token.
 * Supabase handles token refresh automatically, so this avoids
 * the 401 errors that happen when the 1-hour JWT expires.
 */
async function getValidToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? localStorage.getItem('access_token');
}

export const BackendService = {
    // ============================================
    // Authentication
    // ============================================
    syncUser: async (userType?: 'photographer' | 'individual'): Promise<any> => {
        return await RealAuthAPI.syncUser(userType);
    },

    // ============================================
    // Profile
    // ============================================
    getProfile: async (): Promise<PhotographerProfile | null> => {
        return await RealProfileAPI.getProfile();
    },

    getPhotographerProfile: async (id: string): Promise<PhotographerProfile | null> => {
        return await RealProfileAPI.getPhotographerProfile(id);
    },

    updateProfile: async (updates: Partial<PhotographerProfile> & { deleteLogo?: boolean }): Promise<void> => {
        return await RealProfileAPI.updateProfile(updates);
    },

    completeProfile: async (profileData: Partial<PhotographerRegistration>): Promise<boolean> => {
        return await RealProfileAPI.completeProfile(profileData);
    },

    // ============================================
    // Events
    // ============================================
    getEvents: async (page: number = 1, limit: number = 20, search?: string, sortBy?: string, sortDir?: string, status?: string, createdAs?: string): Promise<{ items: Event[], total: number }> => {
        return await RealEventAPI.getEvents(page, limit, search, sortBy, sortDir, status, createdAs);
    },

    getEvent: async (id: string): Promise<Event | undefined> => {
        // If id is numeric, assume it's an ID (for admin/photographer)
        if (/^\d+$/.test(id)) {
            return await RealEventAPI.getEvent(id);
        }
        // Otherwise, assume it's a slug (for public gallery)
        return await RealGalleryAPI.getEventBySlug(id);
    },

    createEvent: async (eventData: Partial<Event>): Promise<Event> => {
        return await RealEventAPI.createEvent(eventData);
    },

    updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
        return await RealEventAPI.updateEvent(id, updates);
    },

    setCoverImage: async (id: string, imageId: string): Promise<void> => {
        return await RealEventAPI.setCoverImage(id, imageId);
    },

    getPresignedCoverUrl: async (eventId: string, filename: string, contentType: string): Promise<{ photoId: number; uploadUrl: string }> => {
        return await RealEventAPI.getPresignedCoverUrl(eventId, filename, contentType);
    },

    deleteEvent: async (id: string): Promise<void> => {
        return await RealEventAPI.deleteEvent(id);
    },

    // ============================================
    // Photos
    // ============================================
    getEventPhotos: async (eventId: string, page: number = 1, limit: number = 50, sortBy: string = 'filename'): Promise<Photo[]> => {
        return await RealPhotoAPI.getEventPhotos(eventId, page, limit, sortBy);
    },

    publishEvent: async (id: string): Promise<Event> => {
        return await RealEventAPI.publishEvent(id);
    },

    getProcessingStatus: async (id: string): Promise<any> => {
        return await RealEventAPI.getProcessingStatus(id);
    },

    getBatches: async (id: string): Promise<any[]> => {
        return await RealEventAPI.getBatches(id);
    },

    getBatchStatus: async (eventId: string, batchId: string): Promise<any> => {
        return await RealEventAPI.getBatchStatus(eventId, batchId);
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        return await RealPhotoAPI.deleteEventPhoto(eventId, photoId);
    },

    getPresignedUrls: async (eventId: string, files: { filename: string; contentType: string }[]): Promise<{ urls: { photoId: string; uploadUrl: string }[] }> => {
        return await RealPhotoAPI.getPresignedUrls(eventId, files);
    },

    confirmUploads: async (eventId: string, photoIds: string[]): Promise<void> => {
        return await RealPhotoAPI.confirmUploads(eventId, photoIds);
    },

    processPhoto: async (eventId: string, photoId: string, resizedFile?: Blob): Promise<any> => {
        return await RealPhotoAPI.processPhoto(eventId, photoId, resizedFile);
    },

    uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
        return await RealPhotoAPI.uploadToS3(uploadUrl, file);
    },

    checkDuplicates: async (eventId: string, filenames: string[]): Promise<{ results: any[] }> => {
        return await RealPhotoAPI.checkDuplicates(eventId, filenames);
    },

    // ============================================
    // Dashboard
    // ============================================
    getDashboardStats: async (): Promise<DashboardStats> => {
        return await RealDashboardAPI.getDashboardStats();
    },

    // ============================================
    // Face Search
    // ============================================
    getPublicPhoto: async (photoId: string): Promise<Photo | undefined> => {
        return await RealGalleryAPI.getPublicPhoto(photoId);
    },

    searchFaces: async (slug: string, selfieFile: File): Promise<Photo[]> => {
        return await RealGalleryAPI.searchFaces(slug, selfieFile);
    },

    // ============================================
    // Share Extensions
    // ============================================
    shareSelection: async (slug: string, imageIds: number[]): Promise<{ selectionId: string; shareLink: string }> => {
        return await RealGalleryAPI.shareSelection(slug, imageIds);
    },

    getSelection: async (slug: string, selectionHash: string): Promise<Photo[]> => {
        return await RealGalleryAPI.getSelection(slug, selectionHash);
    },

    // ============================================
    // Likes
    // ============================================
    togglePhotoLike: async (eventId: string, photoId: string): Promise<{ likesCount: number; message: string }> => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${eventId}/images/${photoId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to toggle like');
        }

        const data = await response.json();
        return {
            likesCount: data.likes_count,
            message: data.message
        };
    },

    // ============================================
    // Tracking & Leads
    // ============================================
    getAllLeads: async (): Promise<any[]> => {
        try {
            const token = await getValidToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/events/leads/all`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) throw new Error('Failed to fetch all leads');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch all leads', error);
            return [];
        }
    },

    getEventLeads: async (eventId: string): Promise<any[]> => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/leads`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) throw new Error('Failed to fetch leads');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch leads', error);
            return [];
        }
    },

    updateLeadStatus: async (eventId: string, leadId: number, isContacted: boolean): Promise<boolean> => {
        try {
            const token = await getValidToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ is_contacted: isContacted }),
            });
            if (!response.ok) {
                console.error(`Lead update returned ${response.status}:`, await response.text());
            }
            return response.ok;
        } catch (error) {
            console.error('Failed to update lead status', error);
            return false;
        }
    },

    deleteLead: async (eventId: string | number, leadId: number): Promise<boolean> => {
        try {
            const token = await getValidToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/leads/${leadId}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            return response.ok || response.status === 204;
        } catch (error) {
            console.error('Failed to delete lead', error);
            return false;
        }
    },

    submitGuestLead: async (slug: string, name: string, phone: string): Promise<{ success: boolean; leadId?: number }> => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/public/${slug}/lead`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phone }),
            });
            if (!response.ok) throw new Error('Failed to save lead');
            const data = await response.json();
            return { success: true, leadId: data.lead_id };
        } catch (error) {
            console.error('Failed to save lead', error);
            return { success: false };
        }
    },

    trackContactSaved: async (slug: string): Promise<void> => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/public/${slug}/track/contact`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to track contact save', error);
        }
    },

    trackTrafficSource: async (slug: string, source: string): Promise<void> => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/track-source`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ source }),
            });
        } catch (error) {
            console.error('Failed to track source', error);
        }
    },

    trackDownloads: async (slug: string, count: number): Promise<void> => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/track-downloads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ count }),
            });
        } catch (error) {
            console.error('Failed to track downloads', error);
        }
    },

    // ============================================
    // Payments
    // ============================================
    mockPay: async (packageId: string): Promise<boolean> => {
        const result = await RealPaymentAPI.mockPay(packageId);
        return result.success;
    },
};
