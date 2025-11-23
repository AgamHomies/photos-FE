import { useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/api';
import { PhotographerProfile, Photo } from '../types';

export const useProfile = () => {
    const [profile, setProfile] = useState<PhotographerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await DataService.getProfile();
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return { profile, loading, error };
};

export const useGallery = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Check session storage for unlock status
    useEffect(() => {
        const unlocked = sessionStorage.getItem('gallery_unlocked');
        if (unlocked === 'true') {
            setIsUnlocked(true);
            loadPhotos();
        }
    }, []);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            const data = await DataService.getGallery();
            setPhotos(data);
        } catch (error) {
            console.error("Failed to load gallery", error);
        } finally {
            setLoading(false);
        }
    };

    const unlockGallery = async (file: File) => {
        setLoading(true);
        try {
            await DataService.uploadUserAccessPhoto(file);
            sessionStorage.setItem('gallery_unlocked', 'true');
            setIsUnlocked(true);
            await loadPhotos();
        } catch (error) {
            console.error("Failed to unlock gallery", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const lockGallery = () => {
        sessionStorage.removeItem('gallery_unlocked');
        setIsUnlocked(false);
        setPhotos([]);
    };

    return { photos, loading, isUnlocked, unlockGallery, lockGallery };
};
