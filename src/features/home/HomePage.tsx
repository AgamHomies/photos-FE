import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/api';
import { PhotographerProfile } from '../../types';
import heroImage from '../../assets/images/IMG_0154.jpeg';

const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);

  useEffect(() => { DataService.getProfile().then(setProfile); }, []);

  if (!profile) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
      <div className="relative z-10 text-center text-white p-4">
        <img src={profile.profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full mx-auto border-4 border-white mb-6 shadow-2xl" />
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-4">{profile.name}</h1>
        <p className="text-xl font-light max-w-2xl mx-auto">{profile.bio}</p>
      </div>
    </div>
  );
};
export default HomePage;