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

// Helper to map backend status to frontend status
const mapEventStatus = (status: string): 'active' | 'expired' => {
    return (status === 'active' || status === 'ready' || status === 'processing' || status === 'draft') ? 'active' : 'expired';
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

    if (response.status === 204) {
        return null;
    }

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
    // Login and Register are handled directly by Supabase client in the UI components
    // We only need to sync the user with our backend after successful Supabase auth

    syncUser: async (): Promise<any> => {
        const token = await getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/auth/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Sync failed');
            }

            return data;
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    },
};

// ============================================
// Profile API
// ============================================
export const RealProfileAPI = {
    getProfile: async (): Promise<PhotographerProfile | null> => {
        const response = await apiRequest('/auth/me');
        const data = response.data; // Access the nested data object

        if (!data || !data.profile) {
            return null;
        }

        return {
            name: data.profile.name,
            bio: data.profile.bio,
            profileImageUrl: data.profile.profileImageUrl || 'https://via.placeholder.com/150',
            contactEmail: data.profile.contactEmail,
            phone: data.profile.phone,
            address: data.profile.address,
            instagramUrl: data.profile.instagramUrl,
            tiktokUrl: data.profile.tiktokUrl,
            facebookUrl: data.profile.facebookUrl,
            websiteUrl: data.profile.websiteUrl,
            portfolio: data.profile.portfolio || [],
        };
    },

    getPhotographerProfile: async (id: string): Promise<PhotographerProfile | null> => {
        try {
            console.log('RealProfileAPI: Fetching public profile for id:', id);
            const response = await apiRequest(`/photographers/${id}`);
            console.log('RealProfileAPI: Raw data received:', response);

            const data = response.data;

            return {
                name: data.name,
                bio: data.bio,
                profileImageUrl: data.profileImageUrl || '',
                contactEmail: data.contactEmail || '',
                phone: data.phone,
                address: '', // Not returned by public API
                websiteUrl: data.websiteUrl,
                instagramUrl: data.instagramUrl,
                tiktokUrl: data.tiktokUrl,
                facebookUrl: data.facebookUrl,
                portfolio: [], // Not returned by public API
            };
        } catch (error) {
            console.error('Failed to get public photographer profile:', error);
            return null;
        }
    },

    updateProfile: async (updates: Partial<PhotographerProfile> & { deleteLogo?: boolean }): Promise<void> => {
        const formData = new FormData();

        // Map fields to form data
        // Check for undefined to allow sending empty strings (to clear fields)
        if (updates.name !== undefined) formData.append('fullName', updates.name);
        if (updates.bio !== undefined) formData.append('description', updates.bio);
        if (updates.phone !== undefined) formData.append('phone', updates.phone);
        if (updates.contactEmail !== undefined) formData.append('contactEmail', updates.contactEmail);

        if (updates.instagramUrl !== undefined) formData.append('instagramUrl', updates.instagramUrl);
        if (updates.tiktokUrl !== undefined) formData.append('tiktokUrl', updates.tiktokUrl);
        if (updates.facebookUrl !== undefined) formData.append('facebookUrl', updates.facebookUrl);
        if (updates.websiteUrl !== undefined) formData.append('websiteUrl', updates.websiteUrl);

        // Add address
        if (updates.address !== undefined) formData.append('address', updates.address);

        // Add logo if present
        if (updates.logo) formData.append('logo', updates.logo);

        // Handle delete logo
        if (updates.deleteLogo) formData.append('deleteLogo', 'true');

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Profile update failed');
        }
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
        if (profileData.websiteUrl) formData.append('websiteUrl', profileData.websiteUrl);

        // Optional file uploads
        if (profileData.logo) formData.append('logo', profileData.logo);
        if (profileData.portfolio && profileData.portfolio.length > 0) {
            profileData.portfolio.forEach((file) => {
                formData.append('portfolio', file);
            });
        }

        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PATCH',
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
    getEvents: async (page: number = 1, limit: number = 20, search?: string): Promise<{ items: Event[], total: number }> => {
        let url = `/events/?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        const data = await apiRequest(url);

        const items = data.items.map((event: any) => ({
            id: event.id,
            photographerId: event.photographer_id,
            name: event.title,
            date: event.event_date.split('T')[0],
            location: event.location || '',
            coverImage: event.cover_image_url || 'https://via.placeholder.com/800x600',
            photoCount: event.images_count || 0,
            guestVisits: event.stats?.views_count || 0,
            downloads: event.stats?.downloads_count || 0,
            phoneSaves: event.stats?.contact_saved_count || 0,
            uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${event.guest_slug || event.id}`,
            expiryDate: event.expiry_date || '',
            status: mapEventStatus(event.status),
            slug: event.guest_slug,
            coupleSlug: event.couple_slug,
            isPublished: event.is_published,
            initialProcessingDone: event.initial_processing_done,
            createdAt: event.created_at,
            packageType: event.package_type || 'basic',
        }));

        return {
            items,
            total: data.total
        };
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
                photoCount: data.images_count || 0,
                guestVisits: data.stats?.views_count || 0,
                downloads: data.stats?.downloads_count || 0,
                phoneSaves: data.stats?.contact_saved_count || 0,
                uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${data.guest_slug || data.id}`,
                expiryDate: data.expiry_date || '',
                status: mapEventStatus(data.status),
                slug: data.guest_slug,
                coupleSlug: data.couple_slug,
                isPublished: data.is_published,
                initialProcessingDone: data.initial_processing_done,
                createdAt: data.created_at,
                packageType: data.package_type || 'basic',
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
            package_type: eventData.packageType || 'basic',
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
            uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${data.guest_slug || data.id}`,
            expiryDate: data.expiry_date || '',
            status: 'active',
            slug: data.guest_slug,
            coupleSlug: data.couple_slug,
            createdAt: data.created_at,
            packageType: data.package_type || 'basic',
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
            photoCount: data.images_count || 0,
            guestVisits: data.stats?.views_count || 0,
            downloads: data.stats?.downloads_count || 0,
            phoneSaves: data.stats?.contact_saved_count || 0,
            uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${data.guest_slug || data.id}`,
            expiryDate: data.expiry_date || '',
            status: mapEventStatus(data.status),
            slug: data.guest_slug,
            coupleSlug: data.couple_slug,
            createdAt: data.created_at,
            packageType: data.package_type || 'basic',
        };
    },

    deleteEvent: async (id: string): Promise<void> => {
        await apiRequest(`/events/${id}`, {
            method: 'DELETE',
        });
    },

    setCoverImage: async (eventId: string, imageId: string): Promise<void> => {
        await apiRequest(`/events/${eventId}/cover?image_id=${imageId}`, {
            method: 'PUT',
        });
    },

    getPresignedCoverUrl: async (eventId: string, filename: string, contentType: string): Promise<{ photoId: number; uploadUrl: string }> => {
        return await apiRequest(`/events/${eventId}/cover/presign`, {
            method: 'POST',
            body: JSON.stringify({ filename, contentType: contentType }),
        });
    },

    publishEvent: async (id: string): Promise<Event> => {
        const data = await apiRequest(`/events/${id}/publish`, {
            method: 'POST',
        });

        return {
            id: data.id,
            photographerId: data.photographer_id,
            name: data.title,
            date: data.event_date.split('T')[0],
            location: data.location || '',
            coverImage: data.cover_image_url || 'https://via.placeholder.com/800x600',
            photoCount: data.images_count || 0,
            guestVisits: data.stats?.views_count || 0,
            downloads: data.stats?.downloads_count || 0,
            phoneSaves: data.stats?.contact_saved_count || 0,
            uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${data.guest_slug || data.id}`,
            expiryDate: data.expiry_date || '',
            status: mapEventStatus(data.status),
            slug: data.guest_slug,
            coupleSlug: data.couple_slug,
            isPublished: data.is_published,
            initialProcessingDone: data.initial_processing_done,
            createdAt: data.created_at,
            packageType: data.package_type || 'basic',
        };
    },

    getProcessingStatus: async (id: string): Promise<any> => {
        return await apiRequest(`/events/${id}/processing-status`);
    },

    getBatches: async (id: string): Promise<any[]> => {
        const data = await apiRequest(`/events/${id}/batches`);
        return data.map((batch: any) => ({
            id: batch.id,
            eventId: batch.event_id,
            totalImages: batch.total_images,
            processedImages: batch.processed_images,
            status: batch.status,
            isInitial: batch.is_initial,
            createdAt: batch.created_at
        }));
    },

    getBatchStatus: async (eventId: string, batchId: string): Promise<any> => {
        const batch = await apiRequest(`/events/${eventId}/batches/${batchId}/status`);
        return {
            id: batch.id,
            eventId: batch.event_id,
            totalImages: batch.total_images,
            processedImages: batch.processed_images,
            status: batch.status,
            isInitial: batch.is_initial,
            createdAt: batch.created_at
        };
    }
};

export const RealPhotoAPI = {
    getEventPhotos: async (eventId: string, page: number = 1, limit: number = 50): Promise<Photo[]> => {
        try {
            const data = await apiRequest(`/events/${eventId}/images?page=${page}&limit=${limit}`);

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

    uploadEventPhotos: async (eventId: string, files: File[]): Promise<any> => {
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

        const data = await response.json();

        // Map response
        return {
            batch: {
                id: data.batch.id,
                eventId: data.batch.event_id,
                totalImages: data.batch.total_images,
                processedImages: data.batch.processed_images,
                status: data.batch.status,
                isInitial: data.batch.is_initial,
                createdAt: data.batch.created_at
            },
            images: data.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                thumbnailUrl: img.thumbnail_url || img.url,
                title: img.filename || 'Photo',
                date: img.created_at,
                width: img.width,
                height: img.height,
            }))
        };
    },

    getPublicPhoto: async (eventId: string, photoId: string): Promise<any> => {
        const data = await apiRequest(`/public/events/${eventId}/images/${photoId}`);
        return {
            id: data.id,
            url: data.url,
            thumbnailUrl: data.thumbnail_url || data.url,
            title: data.filename || 'Photo',
            date: '', // Not critical for public view
            width: data.width,
            height: data.height,
            shareLink: data.shareLink
        };
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        await apiRequest(`/events/${eventId}/images/${photoId}`, {
            method: 'DELETE',
        });
    },

    getPresignedUrls: async (eventId: string, files: { filename: string; contentType: string }[]): Promise<{ urls: { photoId: string; uploadUrl: string }[] }> => {
        return await apiRequest(`/events/${eventId}/photos/presign`, {
            method: 'POST',
            body: JSON.stringify({ files }),
        });
    },

    confirmUploads: async (eventId: string, photoIds: string[]): Promise<void> => {
        await apiRequest(`/events/${eventId}/photos/confirm`, {
            method: 'POST',
            body: JSON.stringify({ photoIds: photoIds }),
        });
    },

    uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });
    },
};

// ============================================
// Dashboard API
// ============================================
export const RealDashboardAPI = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        return await apiRequest('/events/stats');
    },
};

// ============================================
// Public Gallery API (for guests)
// ============================================
export const RealGalleryAPI = {
    getEventBySlug: async (slug: string): Promise<Event | undefined> => {
        try {
            const data = await apiRequest(`/public/events/${slug}`);
            const eventData = data.event;

            return {
                id: eventData.id,
                photographerId: eventData.photographer_id,
                name: eventData.title,
                date: eventData.event_date.split('T')[0],
                location: eventData.location || '',
                coverImage: eventData.cover_image_url || 'https://via.placeholder.com/800x600',
                photoCount: eventData.images_count || 0,
                guestVisits: eventData.guest_visits || 0,
                downloads: eventData.downloads || 0,
                uniqueLink: `${CONFIG.API_BASE_URL}/public/e/${eventData.guest_slug || eventData.id}`,
                expiryDate: eventData.expiry_date || '',
                status: mapEventStatus(eventData.status),
                slug: eventData.guest_slug,
                coupleSlug: eventData.couple_slug,
                mode: data.mode, // Map mode
            };
        } catch (error) {
            console.error('Failed to get event by slug:', error);
            return undefined;
        }
    },

    searchFaces: async (slug: string, selfieFile: File): Promise<Photo[]> => {
        try {
            const formData = new FormData();
            formData.append('selfie', selfieFile);

            const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/search`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Face search failed');
            }

            const data = await response.json();

            // Map the response to Photo objects
            return data.map((img: any) => ({
                id: img.id.toString(),
                url: img.url,
                thumbnailUrl: img.thumbnail_url,
                title: `Photo ${img.id}`,
                matchScore: img.match_score,
                takenAt: img.taken_at
            }));
        } catch (error) {
            console.error('Failed to search faces:', error);
            throw error;
        }
    },

    trackContactSaved: async (slug: string): Promise<void> => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/track-contact-saved`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to track contact saved:', error);
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
            console.error('Failed to track traffic source:', error);
        }
    },

    getPublicPhoto: async (photoId: string): Promise<Photo | undefined> => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/public/photos/${photoId}`);
            if (!response.ok) return undefined;
            const data = await response.json();
            return {
                id: data.id,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl,
                title: data.title,
                date: '',
                width: data.width,
                height: data.height,
                shareLink: data.shareLink
            };
        } catch (error) {
            console.error('Failed to fetch public photo:', error);
            return undefined;
        }
    },

    shareSelection: async (slug: string, imageIds: number[]): Promise<{ selectionId: string; shareLink: string }> => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/share-selection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_ids: imageIds })
        });

        if (!response.ok) {
            throw new Error('Failed to create share selection');
        }
        return await response.json();
    },

    getSelection: async (slug: string, selectionHash: string): Promise<Photo[]> => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${slug}/selection/${selectionHash}`);
        if (!response.ok) {
            throw new Error('Failed to fetch selection');
        }
        const data = await response.json();
        return data.map((img: any) => ({
            id: img.id,
            url: img.url,
            thumbnailUrl: img.thumbnail_url || img.url,
            title: img.title || 'Photo',
            width: img.width,
            height: img.height,
        }));
    },
};

// ============================================
// Payment API
// ============================================
export const RealPaymentAPI = {
    mockPay: async (packageId: string): Promise<any> => {
        return await apiRequest('/payments/mock-pay', {
            method: 'POST',
            body: JSON.stringify({ package_id: packageId }),
        });
    }
};
