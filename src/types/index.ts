export interface PhotographerProfile {
  name: string;
  bio: string;
  profileImageUrl: string;
  contactEmail: string;
  phone?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  portfolio?: File[];
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  date?: string;
  width?: number;
  height?: number;
}

export interface PhotographerRegistration {
  email: string;
  password: string;
  fullName: string;
  description: string;
  address: string;
  phone: string;
  logo: File | null;
  portfolio: File[];
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  termsAccepted: boolean;
}

export interface Event {
  id: string;
  photographerId?: string;
  name: string;
  date: string;
  location: string;
  coverImage: string;
  photoCount: number;
  guestVisits: number;
  downloads: number;
  uniqueLink: string;
  expiryDate: string;
  status: 'active' | 'expired';
}

export interface DashboardStats {
  totalDownloads: number;
  totalPageVisits: number;
  phoneSaves: number;
  activeEvents: number;
  expiredEvents: number;
}