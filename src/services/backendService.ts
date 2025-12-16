/**
 * Unified Backend Service
 * 
 * This service automatically switches between Mock and Real backend
 * based on the CONFIG.USE_MOCK setting.
 * 
 * Import this instead of MockS3Service or RealAPI directly.
 */

import { CONFIG } from '../config';
import { MockS3Service } from './mockS3';
import {
    RealAuthAPI,
    RealProfileAPI,
    RealEventAPI,
    RealPhotoAPI,
    RealDashboardAPI,
    RealGalleryAPI,
} from './realApi';
import { PhotographerRegistration, PhotographerProfile, Photo, Event, DashboardStats } from '../types';

const USE_MOCK = CONFIG.USE_MOCK;

export const BackendService = {
    // ============================================
    // Authentication
    // ============================================
    syncUser: async (): Promise<any> => {
        if (USE_MOCK) {
            console.log('Mock sync user');
            return { success: true };
        }
        return await RealAuthAPI.syncUser();
    },

    // Deprecated methods removed to enforce Supabase Auth flow
    // login, register, logout are handled by supabaseAuthService directly

    // ============================================
    // Profile
    // ============================================
    getProfile: async (): Promise<PhotographerProfile | null> => {
        return USE_MOCK
            ? await MockS3Service.getProfile()
            : await RealProfileAPI.getProfile();
    },

    getPhotographerProfile: async (id: string): Promise<PhotographerProfile | null> => {
        return USE_MOCK
            ? await MockS3Service.getPhotographerProfile(id)
            : await RealProfileAPI.getPhotographerProfile(id);
    },

    updateProfile: async (updates: Partial<PhotographerProfile> & { deleteLogo?: boolean }): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.updateProfile(updates)
            : await RealProfileAPI.updateProfile(updates);
    },

    completeProfile: async (profileData: Partial<PhotographerRegistration>): Promise<boolean> => {
        if (USE_MOCK) {
            console.warn('completeProfile not implemented for mock');
            return false;
        }
        return await RealProfileAPI.completeProfile(profileData);
    },

    // ============================================
    // Events
    // ============================================
    getEvents: async (): Promise<Event[]> => {
        return USE_MOCK
            ? await MockS3Service.getEvents()
            : await RealEventAPI.getEvents();
    },

    getEvent: async (id: string): Promise<Event | undefined> => {
        if (USE_MOCK) {
            return await MockS3Service.getEvent(id);
        }

        // If id is numeric, assume it's an ID (for admin/photographer)
        if (/^\d+$/.test(id)) {
            return await RealEventAPI.getEvent(id);
        }

        // Otherwise, assume it's a slug (for public gallery)
        return await RealGalleryAPI.getEventBySlug(id);
    },

    createEvent: async (eventData: Partial<Event>): Promise<Event> => {
        return USE_MOCK
            ? await MockS3Service.createEvent(eventData)
            : await RealEventAPI.createEvent(eventData);
    },

    updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
        return USE_MOCK
            ? await MockS3Service.updateEvent(id, updates)
            : await RealEventAPI.updateEvent(id, updates);
    },

    setCoverImage: async (id: string, imageId: string): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.setCoverImage(id, imageId)
            : await RealEventAPI.setCoverImage(id, imageId);
    },

    getPresignedCoverUrl: async (eventId: string, filename: string, contentType: string): Promise<{ photoId: number; uploadUrl: string }> => {
        if (USE_MOCK) throw new Error('Not implemented for mock');
        return await RealEventAPI.getPresignedCoverUrl(eventId, filename, contentType);
    },

    deleteEvent: async (id: string): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.deleteEvent(id)
            : await RealEventAPI.deleteEvent(id);
    },



    // ============================================
    // Photos
    // ============================================
    getEventPhotos: async (eventId: string, page: number = 1, limit: number = 50): Promise<Photo[]> => {
        return USE_MOCK
            ? await MockS3Service.getEventPhotos(eventId)
            : await RealPhotoAPI.getEventPhotos(eventId, page, limit);
    },

    uploadEventPhotos: async (eventId: string, files: File[]): Promise<any> => {
        return USE_MOCK
            ? await MockS3Service.uploadEventPhotos(eventId, files)
            : await RealPhotoAPI.uploadEventPhotos(eventId, files);
    },

    publishEvent: async (id: string): Promise<Event> => {
        if (USE_MOCK) {
            const event = await MockS3Service.getEvent(id);
            if (event) event.status = 'active'; // Minimal mock
            return event!;
        }
        return await RealEventAPI.publishEvent(id);
    },

    getProcessingStatus: async (id: string): Promise<any> => {
        if (USE_MOCK) return {
            event_id: id,
            total_images_for_event: 100,
            total_processed_for_event: 100,
            has_initial_batches: true,
            all_initial_batches_done: true,
            initial_processing_done: true,
            is_published: true
        };
        return await RealEventAPI.getProcessingStatus(id);
    },

    getBatches: async (id: string): Promise<any[]> => {
        if (USE_MOCK) return [];
        return await RealEventAPI.getBatches(id);
    },

    getBatchStatus: async (eventId: string, batchId: string): Promise<any> => {
        if (USE_MOCK) return null;
        return await RealEventAPI.getBatchStatus(eventId, batchId);
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.deleteEventPhoto(eventId, photoId)
            : await RealPhotoAPI.deleteEventPhoto(eventId, photoId);
    },

    getPresignedUrls: async (eventId: string, files: { filename: string; contentType: string }[]): Promise<{ urls: { photoId: string; uploadUrl: string }[] }> => {
        if (USE_MOCK) throw new Error('Not implemented for mock');
        return await RealPhotoAPI.getPresignedUrls(eventId, files);
    },

    confirmUploads: async (eventId: string, photoIds: string[]): Promise<void> => {
        if (USE_MOCK) throw new Error('Not implemented for mock');
        return await RealPhotoAPI.confirmUploads(eventId, photoIds);
    },

    uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
        if (USE_MOCK) throw new Error('Not implemented for mock');
        return await RealPhotoAPI.uploadToS3(uploadUrl, file);
    },

    // ============================================
    // Dashboard
    // ============================================
    getDashboardStats: async (): Promise<DashboardStats> => {
        return USE_MOCK
            ? await MockS3Service.getDashboardStats()
            : await RealDashboardAPI.getDashboardStats();
    },

    // ============================================
    // Gallery (legacy methods for compatibility)
    // ============================================
    getGallery: async (): Promise<Photo[]> => {
        if (!USE_MOCK) {
            console.warn('getGallery not implemented for real backend');
            return [];
        }
        return await MockS3Service.getGallery();
    },

    uploadPhoto: async (file: File): Promise<Photo> => {
        if (!USE_MOCK) {
            throw new Error('uploadPhoto not implemented for real backend');
        }
        return await MockS3Service.uploadPhoto(file);
    },

    // ============================================
    // Face Search
    // ============================================
    getPublicPhoto: async (photoId: string): Promise<Photo | undefined> => {
        if (USE_MOCK) {
            // Mock implementation
            const gallery = await MockS3Service.getGallery();
            return gallery.find(p => p.id === photoId);
        }
        return await RealGalleryAPI.getPublicPhoto(photoId);
    },

    searchFaces: async (slug: string, selfieFile: File): Promise<Photo[]> => {
        if (USE_MOCK) {
            console.warn('Face search not implemented for mock, returning empty array');
            return [];
        }
        return await RealGalleryAPI.searchFaces(slug, selfieFile);
    },

    // ============================================
    // Tracking
    // ============================================
    trackContactSaved: async (slug: string): Promise<void> => {
        if (USE_MOCK) {
            console.log('Mock: tracking contact saved');
            return;
        }
        return await RealGalleryAPI.trackContactSaved(slug);
    },

    trackTrafficSource: async (slug: string, source: string): Promise<void> => {
        if (USE_MOCK) {
            console.log('Mock: tracking traffic source:', source);
            return;
        }
        return await RealGalleryAPI.trackTrafficSource(slug, source);
    },
    // ============================================
    // Share Extensions
    // ============================================
    shareSelection: async (slug: string, imageIds: number[]): Promise<{ selectionId: string; shareLink: string }> => {
        if (USE_MOCK) {
            console.warn('shareSelection not implemented for mock');
            return { selectionId: 'mock-hash', shareLink: 'http://localhost:3000/s/mock-hash' };
        }
        return await RealGalleryAPI.shareSelection(slug, imageIds);
    },

    getSelection: async (slug: string, selectionHash: string): Promise<Photo[]> => {
        if (USE_MOCK) {
            console.warn('getSelection not implemented for mock');
            return [];
        }
        return await RealGalleryAPI.getSelection(slug, selectionHash);
    },
};

// Export for backward compatibility
export { BackendService as MockS3Service };
