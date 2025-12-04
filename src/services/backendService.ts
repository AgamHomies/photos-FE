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

    getPhotographerProfile: async (email: string): Promise<PhotographerProfile | null> => {
        return USE_MOCK
            ? await MockS3Service.getPhotographerProfile(email)
            : await RealProfileAPI.getPhotographerProfile(email);
    },

    updateProfile: async (updates: Partial<PhotographerProfile>): Promise<void> => {
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
        return USE_MOCK
            ? await MockS3Service.getEvent(id)
            : await RealEventAPI.getEvent(id);
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

    deleteEvent: async (id: string): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.deleteEvent(id)
            : await RealEventAPI.deleteEvent(id);
    },



    // ============================================
    // Photos
    // ============================================
    getEventPhotos: async (eventId: string): Promise<Photo[]> => {
        return USE_MOCK
            ? await MockS3Service.getEventPhotos(eventId)
            : await RealPhotoAPI.getEventPhotos(eventId);
    },

    uploadEventPhotos: async (eventId: string, files: File[]): Promise<Photo[]> => {
        return USE_MOCK
            ? await MockS3Service.uploadEventPhotos(eventId, files)
            : await RealPhotoAPI.uploadEventPhotos(eventId, files);
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        return USE_MOCK
            ? await MockS3Service.deleteEventPhoto(eventId, photoId)
            : await RealPhotoAPI.deleteEventPhoto(eventId, photoId);
    },

    // ============================================
    // Dashboard
    // ============================================
    getDashboardStats: async (events?: Event[]): Promise<DashboardStats> => {
        return USE_MOCK
            ? await MockS3Service.getDashboardStats(events)
            : await RealDashboardAPI.getDashboardStats(events);
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
};

// Export for backward compatibility
export { BackendService as MockS3Service };
