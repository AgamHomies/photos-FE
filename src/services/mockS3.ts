import { PhotographerRegistration, PhotographerProfile, Photo } from '../types';

const STORAGE_KEY = 'mock_s3_data';
const CURRENT_USER_KEY = 'current_user_email';

interface MockS3Data {
    users: Record<string, PhotographerRegistration>;
    profiles: Record<string, PhotographerProfile>;
    galleries: Record<string, Photo[]>;
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
        }
    },
    profiles: {
        'user1@test.com': {
            name: 'Ronny The Shooter',
            bio: 'Professional wedding photographer with 10 years of experience.',
            profileImageUrl: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user1@test.com'
        },
        'user2@test.com': {
            name: 'Dana Clicks',
            bio: 'Capturing moments that last a lifetime. Specializing in events and portraits.',
            profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user2@test.com'
        },
        'user3@test.com': {
            name: 'Yossi Focus',
            bio: 'Artistic photography for unique events.',
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80',
            contactEmail: 'user3@test.com'
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
        }))
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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const s3Data = loadData();

        if (s3Data.users[data.email]) {
            throw new Error('User already exists');
        }

        s3Data.users[data.email] = data;

        // Create initial profile from registration data
        s3Data.profiles[data.email] = {
            name: data.fullName,
            bio: data.description,
            profileImageUrl: data.logo ? URL.createObjectURL(data.logo) : 'https://via.placeholder.com/150',
            contactEmail: data.email
        };

        s3Data.galleries[data.email] = [];

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
    }
};
