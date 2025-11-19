import React, { useState } from 'react';
import { DataService } from '../../services/api';
import { Photo } from '../../types';
import { Lock, Upload, Loader2 } from 'lucide-react';

const GalleryPage: React.FC = () => {
  const [access, setAccess] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLoading(true);
      await DataService.uploadUserAccessPhoto(e.target.files[0]);
      const data = await DataService.getGallery();
      setPhotos(data);
      setAccess(true);
      setLoading(false);
    }
  };

  if (!access) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-lightgray max-w-md">
          <Lock className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Gallery Locked</h2>
          <p className="text-secondary mb-6">Upload a photo to unlock the full portfolio.</p>
          <label className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-full cursor-pointer hover:bg-black transition">
            {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            <span>{loading ? 'Unlocking...' : 'Upload to Unlock'}</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {photos.map(photo => (
        <div key={photo.id} className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow hover:shadow-2xl transition duration-500 cursor-pointer group">
          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        </div>
      ))}
    </div>
  );
};
export default GalleryPage;