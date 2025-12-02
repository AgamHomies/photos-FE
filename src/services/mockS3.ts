import { PhotographerRegistration, PhotographerProfile, Photo, Event, DashboardStats } from '../types';

const STORAGE_KEY = 'mock_s3_data_v2';
const CURRENT_USER_KEY = 'current_user_email';

interface MockS3Data {
    users: Record<string, PhotographerRegistration>;
    profiles: Record<string, PhotographerProfile>;
    galleries: Record<string, Photo[]>;
    events: Record<string, Event[]>;
}

// Initial Mock Data
const INITIAL_DATA: MockS3Data = {
    users: {
        'user1@test.com': {
            email: 'user1@test.com',
            password: 'password1',
            fullName: 'Ronny The Shooter',
            description: 'Professional wedding photographer with 10 years of experience.',
            address: 'Tel Aviv, Israel',
            phone: '050-1111111',
            logo: null,
            portfolio: [],
            termsAccepted: true
        },
        'user2@test.com': {
            email: 'user2@test.com',
            password: 'password2',
            fullName: 'Dana Clicks',
            description: 'Capturing moments that last a lifetime. Specializing in events and portraits.',
            address: 'Haifa, Israel',
            phone: '050-2222222',
            logo: null,
            portfolio: [],
            termsAccepted: true
        },
        'user3@test.com': {
            email: 'user3@test.com',
            password: 'password3',
            fullName: 'Yossi Focus',
            description: 'Artistic photography for unique events.',
            address: 'Jerusalem, Israel',
            phone: '050-3333333',
            logo: null,
            portfolio: [],
            termsAccepted: true
        },
        'shira@happyguests.com': {
            email: 'shira@happyguests.com',
            password: 'password4',
            fullName: 'Happy Guests Shira',
            description: 'Specializing in candid moments and happy guests.',
            address: 'Eilat, Israel',
            phone: '050-4444444',
            logo: null,
            portfolio: [],
            termsAccepted: true
        }
    },
    profiles: {
        'user1@test.com': {
            name: 'Ronny The Shooter',
            bio: 'Professional wedding photographer with 10 years of experience.',
            profileImageUrl: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user1@test.com',
            phone: '050-1111111',
            instagramUrl: 'https://instagram.com/ronny_shooter',
            portfolio: []
        },
        'user2@test.com': {
            name: 'Dana Clicks',
            bio: 'Capturing moments that last a lifetime. Specializing in events and portraits.',
            profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user2@test.com',
            phone: '050-2222222',
            instagramUrl: 'https://instagram.com/dana_clicks',
            portfolio: []
        },
        'user3@test.com': {
            name: 'Yossi Focus',
            bio: 'Artistic photography for unique events.',
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user3@test.com',
            phone: '050-3333333',
            instagramUrl: 'https://instagram.com/yossi_focus',
            portfolio: []
        },
        'shira@happyguests.com': {
            name: 'Happy Guests Shira',
            bio: 'Specializing in candid moments and happy guests.',
            profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'shira@happyguests.com',
            phone: '050-4444444',
            instagramUrl: 'https://instagram.com/happy_shira',
            portfolio: []
        }
    },
    galleries: {
        'user1@test.com': Array.from({ length: 10 }).map((_, i) => ({
            id: `u1-${i}`,
            url: `https://picsum.photos/800/600?random=${100 + i}`,
            title: `Ronny's Shot ${i + 1}`
        })),
        'user2@test.com': Array.from({ length: 10 }).map((_, i) => ({
            id: `u2-${i}`,
            url: `https://picsum.photos/800/600?random=${200 + i}`,
            title: `Dana's Shot ${i + 1}`
        })),
        'user3@test.com': Array.from({ length: 10 }).map((_, i) => ({
            id: `u3-${i}`,
            url: `https://picsum.photos/800/600?random=${300 + i}`,
            title: `Yossi's Shot ${i + 1}`
        })),
        'shira@happyguests.com': Array.from({ length: 15 }).map((_, i) => ({
            id: `shira-${i}`,
            url: `https://picsum.photos/800/600?random=${400 + i}`,
            title: `Happy Guest ${i + 1}`
        }))
    },
    events: {
        'user1@test.com': [
            {
                id: 'evt-1',
                photographerId: 'user1@test.com',
                name: 'Wedding of Sarah & Tom',
                date: '2023-10-15',
                location: 'Tel Aviv',
                coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.0.3&auto=format&fit=crop&w=800&q=80',
                photoCount: 450,
                guestVisits: 120,
                downloads: 85,
                uniqueLink: 'https://photos.com/e/sarah-tom',
                expiryDate: '2024-10-15',
                status: 'active'
            },
            {
                id: 'evt-2',
                photographerId: 'user1@test.com',
                name: 'Bar Mitzvah of David',
                date: '2023-09-20',
                location: 'Jerusalem',
                coverImage: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?ixlib=rb-1.0.3&auto=format&fit=crop&w=800&q=80',
                photoCount: 300,
                guestVisits: 80,
                downloads: 40,
                uniqueLink: 'https://photos.com/e/david-bm',
                expiryDate: '2023-10-20',
                status: 'expired'
            }
        ],
        'user2@test.com': [],
        'user3@test.com': [],
        'shira@happyguests.com': []
    }
};

const loadData = (): MockS3Data => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
        return INITIAL_DATA;
    }
    return JSON.parse(stored);
};

const saveData = (data: MockS3Data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const MockS3Service = {
    register: async (data: PhotographerRegistration): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const s3Data = loadData();

        if (s3Data.users[data.email]) {
            throw new Error('User already exists');
        }

        s3Data.users[data.email] = data;

        s3Data.profiles[data.email] = {
            name: data.fullName,
            bio: data.description,
            profileImageUrl: data.logo ? URL.createObjectURL(data.logo) : 'https://via.placeholder.com/150',
            contactEmail: data.email,
            phone: data.phone,
            instagramUrl: data.instagramUrl,
            portfolio: data.portfolio
        };

        s3Data.galleries[data.email] = [];
        s3Data.events[data.email] = [];

        saveData(s3Data);
        return true;
    },

    login: async (email: string, password: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const s3Data = loadData();
        const user = s3Data.users[email];

        if (user && user.password === password) {
            localStorage.setItem(CURRENT_USER_KEY, email);
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUserEmail: (): string | null => {
        return localStorage.getItem(CURRENT_USER_KEY);
    },

    getProfile: async (): Promise<PhotographerProfile | null> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) return null;

        const s3Data = loadData();
        return s3Data.profiles[email] || null;
    },

    getPhotographerProfile: async (email: string): Promise<PhotographerProfile | null> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const s3Data = loadData();
        return s3Data.profiles[email] || null;
    },

    getGallery: async (): Promise<Photo[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) return [];

        const s3Data = loadData();
        return s3Data.galleries[email] || [];
    },

    uploadPhoto: async (file: File): Promise<Photo> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) throw new Error('Not authenticated');

        const s3Data = loadData();
        const newPhoto: Photo = {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            title: file.name
        };

        if (!s3Data.galleries[email]) {
            s3Data.galleries[email] = [];
        }
        s3Data.galleries[email].unshift(newPhoto);
        saveData(s3Data);

        return newPhoto;
    },

    getDashboardStats: async (events?: Event[]): Promise<DashboardStats> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) throw new Error('Not authenticated');

        const s3Data = loadData();
        const userEvents = events || s3Data.events[email] || [];

        const stats: DashboardStats = {
            totalDownloads: userEvents.reduce((acc, curr) => acc + curr.downloads, 0),
            totalPageVisits: userEvents.reduce((acc, curr) => acc + curr.guestVisits, 0),
            phoneSaves: Math.floor(userEvents.reduce((acc, curr) => acc + curr.guestVisits, 0) * 0.4),
            activeEvents: userEvents.filter(e => e.status === 'active').length,
            expiredEvents: userEvents.filter(e => e.status === 'expired').length
        };

        return stats;
    },

    getEvents: async (): Promise<Event[]> => {
        await new Promise(resolve => setTimeout(resolve, 700));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) return [];

        const s3Data = loadData();
        return s3Data.events[email] || [];
    },

    createEvent: async (eventData: Partial<Event>): Promise<Event> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const s3Data = loadData();
        const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);

        if (!currentUserEmail) throw new Error("Not authenticated");

        const newEvent: Event = {
            id: Math.random().toString(36).substr(2, 9),
            photographerId: currentUserEmail,
            name: eventData.name || 'New Event',
            date: eventData.date || new Date().toISOString().split('T')[0],
            location: eventData.location || '',
            coverImage: eventData.coverImage || '',
            uniqueLink: `http://localhost:3000/gallery/${Math.random().toString(36).substr(2, 9)}`,
            status: 'active',
            expiryDate: eventData.expiryDate || '',
            photoCount: 0,
            guestVisits: 0,
            downloads: 0
        };

        if (!s3Data.events[currentUserEmail]) {
            s3Data.events[currentUserEmail] = [];
        }
        s3Data.events[currentUserEmail].push(newEvent);
        saveData(s3Data);
        return newEvent;
    },

    getEvent: async (id: string): Promise<Event | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const s3Data = loadData();

        // Search across all users' events
        for (const email in s3Data.events) {
            const event = s3Data.events[email].find(e => e.id === id);
            if (event) return event;
        }
        return undefined;
    },

    updateEvent: async (id: string, updates: Partial<Event>): Promise<Event> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const s3Data = loadData();
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) throw new Error("Not authenticated");

        const events = s3Data.events[email];
        const index = events?.findIndex(e => e.id === id);

        if (!events || index === undefined || index === -1) throw new Error("Event not found");

        events[index] = { ...events[index], ...updates };
        saveData(s3Data);
        return events[index];
    },

    getEventPhotos: async (eventId: string): Promise<Photo[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return Array.from({ length: 12 }).map((_, i) => ({
            id: `photo-${eventId}-${i}`,
            url: `https://picsum.photos/seed/${eventId}-${i}/800/600`,
            thumbnailUrl: `https://picsum.photos/seed/${eventId}-${i}/200/200`,
            title: `Photo ${i + 1}`,
            date: new Date().toISOString(),
            width: 800,
            height: 600
        }));
    },

    uploadEventPhotos: async (eventId: string, files: File[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const s3Data = loadData();
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) return;

        const event = s3Data.events[email]?.find(e => e.id === eventId);
        if (event) {
            event.photoCount += files.length;
            saveData(s3Data);
        }
    },

    deleteEventPhoto: async (eventId: string, photoId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const s3Data = loadData();
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) return;

        const event = s3Data.events[email]?.find(e => e.id === eventId);
        if (event && event.photoCount > 0) {
            event.photoCount -= 1;
            saveData(s3Data);
        }
    },

    deleteEvent: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) throw new Error('Not authenticated');

        const s3Data = loadData();
        if (s3Data.events[email]) {
            s3Data.events[email] = s3Data.events[email].filter(e => e.id !== id);
            saveData(s3Data);
        }
    },

    updateProfile: async (updates: Partial<PhotographerProfile>): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const email = localStorage.getItem(CURRENT_USER_KEY);
        if (!email) throw new Error('Not authenticated');

        const s3Data = loadData();
        if (s3Data.profiles[email]) {
            s3Data.profiles[email] = { ...s3Data.profiles[email], ...updates };
            saveData(s3Data);
        }
    }
};
