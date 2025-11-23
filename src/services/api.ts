import { Photo, PhotographerProfile } from '../types';
import { MockS3Service } from './mockS3';

export const DataService = {
  getProfile: async (): Promise<PhotographerProfile> => {
    const profile = await MockS3Service.getProfile();
    if (!profile) {
      // Fallback for when no user is logged in, or for the homepage demo if needed
      // For now, we'll return a default demo profile if no user is logged in
      return {
        name: "Demo Photographer",
        bio: "Please log in to see your profile.",
        profileImageUrl: "https://via.placeholder.com/150",
        contactEmail: "demo@example.com"
      };
    }
    return profile;
  },

  getGallery: async (): Promise<Photo[]> => {
    return MockS3Service.getGallery();
  },

  uploadUserAccessPhoto: async (_file: File): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  },

  uploadGalleryPhoto: async (file: File): Promise<Photo> => {
    return MockS3Service.uploadPhoto(file);
  },

  updateProfile: async (data: Partial<PhotographerProfile>): Promise<void> => {
    // This would also update S3 in a real app
    console.log('Update profile not implemented in mock S3 yet', data);
  }
};