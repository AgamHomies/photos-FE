export interface PhotographerProfile {

  name: string;
  bio: string;
  profileImageUrl: string;
  contactEmail: string;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
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
  termsAccepted: boolean;
}