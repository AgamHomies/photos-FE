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