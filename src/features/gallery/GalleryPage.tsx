import React, { useState, useEffect } from 'react';
import { useGallery } from '../../hooks/useData';
import { Lock, Upload, Loader2, X, LogOut } from 'lucide-react';
import { Photo } from '../../types';

const GalleryPage: React.FC = () => {
  const { photos, loading, isUnlocked, unlockGallery, lockGallery } = useGallery();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [isGalleryReady, setIsGalleryReady] = useState(false);

  useEffect(() => {
    if (photos.length > 0 && imagesLoadedCount >= photos.length) {
      setIsGalleryReady(true);
    }
  }, [imagesLoadedCount, photos.length]);

  const handleImageLoad = () => {
    setImagesLoadedCount(prev => prev + 1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await unlockGallery(e.target.files[0]);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAFAF5]">
        <div className="bg-white p-12 md:p-16 rounded-sm shadow-2xl border border-[#E5E5E0] max-w-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C2B280]"></div>
          <Lock className="w-12 h-12 text-[#C2B280] mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-serif text-[#4A4A4A] mb-4 tracking-wide">Private Collection</h2>
          <p className="text-[#8C8C8C] mb-10 font-light tracking-wide leading-relaxed">
            This gallery is password protected. <br /> Please upload your access key to view the memories.
          </p>
          <label className="inline-flex items-center justify-center gap-3 bg-[#C2B280] text-white py-4 px-10 rounded-full cursor-pointer hover:bg-[#B0A070] transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1">
            {loading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
            <span className="uppercase tracking-widest text-xs font-bold">{loading ? 'Unlocking...' : 'Upload to Unlock'}</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Loading Overlay */}
      {!isGalleryReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAF5] transition-opacity duration-700">
          <Loader2 className="w-12 h-12 text-[#C2B280] animate-spin mb-4" />
          <p className="text-[#8C8C8C] font-serif tracking-widest text-sm animate-pulse">DEVELOPING MEMORIES...</p>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${isGalleryReady ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <div className="relative pt-20 pb-16 text-center px-4">
          <button
            onClick={lockGallery}
            className="absolute top-6 right-6 flex items-center gap-2 text-[#8C8C8C] hover:text-[#C2B280] transition-colors text-sm uppercase tracking-widest font-bold"
          >
            <LogOut size={16} />
            <span>Exit</span>
          </button>

          <span className="uppercase tracking-[0.3em] text-[#C2B280] text-xs font-bold mb-4 block">Wedding Photography</span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#4A4A4A] mb-6">Timeless Memories</h1>
          <p className="text-[#8C8C8C] max-w-2xl mx-auto font-light italic text-lg">
            "Capturing the moments that make your heart skip a beat."
          </p>
          <div className="w-16 h-[1px] bg-[#C2B280] mx-auto mt-10"></div>
        </div>

        {/* Masonry Grid */}
        <div className="container mx-auto px-4 md:px-8 pb-20">
          <div className="columns-3 md:columns-5 lg:columns-6 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="break-inside-avoid cursor-pointer group relative"
              >
                <div className="relative overflow-hidden rounded-sm">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-[1.5s] ease-in-out"
                    loading="eager"
                    onLoad={handleImageLoad}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 p-4 animate-fade-in backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-8 right-8 text-[#4A4A4A] hover:text-[#C2B280] transition duration-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={48} strokeWidth={1} />
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[85vh] w-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default GalleryPage;