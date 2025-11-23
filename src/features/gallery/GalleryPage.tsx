import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MockS3Service } from '../../services/mockS3';
import { Event, Photo, PhotographerProfile } from '../../types';
import {
  Camera,
  Download,
  Share2,
  Instagram,
  Phone,
  MapPin,
  Calendar,
  Search,
  Loader2,
  X
} from 'lucide-react';

interface GalleryPageProps {
  mode: 'guest' | 'full';
}

const GalleryPage: React.FC<GalleryPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // View state logic: if full mode, start directly at results. If guest, start at landing.
  const [viewState, setViewState] = useState<'landing' | 'scanning' | 'results'>(
    mode === 'full' ? 'results' : 'landing'
  );

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]); // All photos (for full view) or matched photos (for guest view)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  // Refs for scrolling
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, mode]);

  const loadData = async (eventId: string) => {
    try {
      const [eventData, eventPhotos] = await Promise.all([
        MockS3Service.getEvent(eventId),
        MockS3Service.getEventPhotos(eventId)
      ]);

      if (eventData) {
        setEvent(eventData);
        if (eventData.photographerId) {
          const profile = await MockS3Service.getPhotographerProfile(eventData.photographerId);
          setPhotographer(profile);
        }
      }

      // If in full mode, show all photos immediately
      if (mode === 'full') {
        setPhotos(eventPhotos);
      }
    } catch (error) {
      console.error("Failed to load gallery data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setViewState('scanning');
      simulateScanning();
    }
  };

  const simulateScanning = async () => {
    // Simulate processing time
    setTimeout(async () => {
      if (id) {
        const allPhotos = await MockS3Service.getEventPhotos(id);
        // Simulate finding matches (randomly select 30-50% of photos)
        const matches = allPhotos.filter(() => Math.random() > 0.6);
        setPhotos(matches);
        setViewState('results');
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 3000);
  };

  const handleShare = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'תמונה מהאירוע',
          text: `תמונה מהאירוע ${event?.name}`,
          url: photo.url,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(photo.url);
      alert('הקישור לתמונה הועתק ללוח');
    }
  };

  const handleDownload = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback for cross-origin images that block fetch
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `photo-${photo.id}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
    alert(`מוריד ${photos.length} תמונות...`);
  };

  const handleSavePhone = () => {
    if (photographer?.phone) {
      navigator.clipboard.writeText(photographer.phone);
      alert(`המספר ${photographer.phone} הועתק ללוח`);
    } else {
      alert('מספר טלפון לא זמין');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 font-serif">טוען גלריה...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">אירוע לא נמצא</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800" dir="rtl">

      {/* Photographer Branding Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {photographer?.profileImageUrl ? (
              <img src={photographer.profileImageUrl} alt="Photographer" className="w-10 h-10 rounded-full object-cover border border-stone-200" />
            ) : (
              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-stone-500" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm leading-tight">{photographer?.name || 'הצלם שלך'}</h2>
              <p className="text-[10px] text-stone-500">צילום אירועים מקצועי</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {photographer?.instagramUrl && (
              <a href={photographer.instagramUrl} target="_blank" rel="noreferrer" className="p-2 text-stone-400 hover:text-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={handleSavePhone}
              className="bg-stone-900 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 hover:bg-stone-800 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>שמור טלפון</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Event Info */}
      <div className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
        </div>

        <div className="relative max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-6 border border-white/20">
            <Calendar className="w-3 h-3" />
            <span>{event.date}</span>
            <span className="mx-1">•</span>
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">{event.name}</h1>
          <p className="text-stone-300 text-lg max-w-lg mx-auto leading-relaxed">
            {mode === 'full'
              ? 'ברוכים הבאים לגלריה המלאה. כל הרגעים היפים מהאירוע במקום אחד.'
              : 'ברוכים הבאים לגלריה הרשמית. כאן תוכלו למצוא את כל הרגעים היפים מהאירוע.'}
          </p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10 pb-20">

        {/* Guest Mode: Landing State */}
        {mode === 'guest' && viewState === 'landing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-stone-100">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">מצא את התמונות שלי</h2>
            <p className="text-stone-500 mb-8 max-w-sm mx-auto">
              העלה תמונת סלפי קצרה, והמערכת החכמה שלנו תמצא את כל התמונות שלך מהאירוע תוך שניות.
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <label className="bg-stone-900 text-white py-4 px-6 rounded-xl font-bold text-lg cursor-pointer hover:bg-stone-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3">
                <Camera className="w-6 h-6" />
                <span>העלה סלפי לחיפוש</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        )}

        {/* Guest Mode: Scanning State */}
        {mode === 'guest' && viewState === 'scanning' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto border border-stone-100">
            <div className="relative w-32 h-32 mx-auto mb-8">
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selfie"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                />
              )}
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 border border-amber-200 rounded-full animate-spin border-t-amber-500"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 animate-pulse">מחפש אותך בתמונות...</h2>
            <p className="text-stone-500">סורק אלפי תמונות באמצעות בינה מלאכותית</p>
          </div>
        )}

        {/* Results State */}
        {viewState === 'results' && (
          <div ref={resultsRef} className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 mt-8">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {mode === 'full' ? 'כל התמונות' : 'התמונות שלך'}
                </h2>
                <p className="text-stone-500 text-sm">
                  {mode === 'full'
                    ? `סה"כ ${photos.length} תמונות בגלריה`
                    : `נמצאו ${photos.length} תמונות`
                  }
                </p>
              </div>
              <button
                onClick={handleDownloadAll}
                className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">הורד הכל</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className="group relative aspect-[2/3] bg-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt="Event"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none">
                    <div className="transform -rotate-45 text-white font-bold text-2xl border-2 border-white px-4 py-1 rounded-lg">
                      {photographer?.name || 'PREVIEW'}
                    </div>
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={(e) => handleDownload(photo, e)}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-stone-900 transition-colors"
                        title="הורד תמונה"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleShare(photo, e)}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-stone-900 transition-colors"
                        title="שתף"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {photos.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">לא נמצאו תמונות</h3>
                {mode === 'guest' ? (
                  <>
                    <p className="text-stone-500 max-w-xs mx-auto mt-2">
                      לא הצלחנו למצוא תמונות תואמות. נסה להעלות תמונה אחרת.
                    </p>
                    <button
                      onClick={() => setViewState('landing')}
                      className="mt-6 text-amber-600 font-medium hover:underline"
                    >
                      נסה שוב
                    </button>
                  </>
                ) : (
                  <p className="text-stone-500 max-w-xs mx-auto mt-2">
                    הגלריה ריקה כרגע.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-stone-400 text-sm mb-2">צולם באהבה על ידי</p>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-6">{photographer?.name}</h3>
          <div className="flex justify-center gap-4 mb-8">
            {photographer?.portfolio?.slice(0, 3).map((file, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100">
                <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs">
                  תיק עבודות
                </div>
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-xs">
            © כל הזכויות שמורות ל{photographer?.name}. נבנה באמצעות PhotosApp.
          </p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-full max-h-full">
            <img
              src={lightboxPhoto.url}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            />

            {/* Lightbox Actions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={(e) => handleDownload(lightboxPhoto, e)}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>הורד</span>
              </button>
              <button
                onClick={(e) => handleShare(lightboxPhoto, e)}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>שתף</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;