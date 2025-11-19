import { Photo, PhotographerProfile } from '../types';
import localProfilePic from '../assets/images/my-profile-pic.jpg';

const MOCK_PROFILE: PhotographerProfile = {
  name: "Blackmailer The Photographer",
  bio: "Capturing light, darkness, and everything in between.",
  profileImageUrl: localProfilePic,
  contactEmail: "Blackmailers@lenscraft.com"
};

const MOCK_GALLERY: Photo[] = Array.from({ length: 6 }).map((_, i) => ({
  id: String(i),
  url: `https://picsum.photos/600/800?random=${i + 10}`,
  title: `Shot ${i + 1}`
}));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const DataService = {
  getProfile: async (): Promise<PhotographerProfile> => {
    await delay(500);
    return MOCK_PROFILE;
  },

  getGallery: async (): Promise<Photo[]> => {
    await delay(800);
    return MOCK_GALLERY;
  },

  uploadUserAccessPhoto: async (_file: File): Promise<boolean> => {
    await delay(1500);
    return true; 
  },

  uploadGalleryPhoto: async (file: File): Promise<Photo> => {
    await delay(2000); 
    
    const newPhoto: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file), 
      title: file.name
    };

    MOCK_GALLERY.unshift(newPhoto); 

    return newPhoto;
  },


  updateProfile: async (data: Partial<PhotographerProfile>): Promise<void> => {
    await delay(1000);
    Object.assign(MOCK_PROFILE, data);
  }
};