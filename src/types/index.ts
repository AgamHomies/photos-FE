export interface PhotographerProfile {
  name: string;
  bio: string;
  profileImageUrl: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  logo?: File;
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
  websiteUrl?: string;
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
  phoneSaves?: number;
  slug?: string;
  coupleSlug?: string;

  mode?: 'guest' | 'full';
  
  // Publishing & Processing
  isPublished?: boolean;
  initialProcessingDone?: boolean; // Frontend property (camelCase)
  createdAt?: string;
}

export interface Batch {
  id: string;
  eventId: number;
  totalImages: number;
  processedImages: number;
  status: 'processing' | 'done' | 'failed';
  isInitial: boolean;
  createdAt: string;
}

export interface ProcessingStatus {
  event_id: number;
  total_images_for_event: number;
  total_processed_for_event: number;
  has_initial_batches: boolean;
  all_initial_batches_done: boolean;
  initial_processing_done: boolean;
  is_published: boolean;
}

export interface EventUploadResponse {
  batch: Batch;
  images: Photo[];
}

export interface DashboardStats {
  totalDownloads: number;
  totalPageVisits: number;
  phoneSaves: number;
  activeEvents: number;
  expiredEvents: number;
  totalSocialTraffic: number;
}