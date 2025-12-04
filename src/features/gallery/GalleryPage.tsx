import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
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
  X,
  CheckCircle2
} from 'lucide-react';

interface GalleryPageProps {
  mode: 'guest' | 'full';
}

const GalleryPage: React.FC<GalleryPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState<'landing' | 'scanning' | 'results'>(
    mode === 'full' ? 'results' : 'landing'
  );

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, mode]);

  const loadData = async (eventId: string) => {
    try {
      const [eventData, eventPhotos] = await Promise.all([
        BackendService.getEvent(eventId),
        BackendService.getEventPhotos(eventId)
      ]);

      if (eventData) {
        setEvent(eventData);
        if (eventData.photographerId) {
          const profile = await BackendService.getPhotographerProfile(eventData.photographerId);
          setPhotographer(profile);
        }
      }

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
    setTimeout(async () => {
      if (id) {
        const allPhotos = await BackendService.getEventPhotos(id);
        const matches = allPhotos.filter(() => Math.random() > 0.6);
        setPhotos(matches);
        setViewState('results');
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
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-500">טוען גלריה...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">אירוע לא נמצא</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800" dir="rtl">

      {/* Photographer Branding Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {photographer?.profileImageUrl ? (
              <img src={photographer.profileImageUrl} alt="Photographer" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Camera className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm leading-tight text-slate-900">{photographer?.name || 'הצלם שלך'}</h2>
              <p className="text-[11px] text-slate-500 font-medium">צילום אירועים מקצועי</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {photographer?.instagramUrl && (
              <a href={photographer.instagramUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-pink-600 transition-colors bg-slate-50 rounded-full">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={handleSavePhone}
              className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-colors font-medium shadow-sm"
            >
              <Phone className="w-3 h-3" />
              <span>שמור טלפון</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Event Info */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium mb-8 border border-white/20 shadow-lg">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{event.location}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">{event.name}</h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
            {mode === 'full'
              ? 'ברוכים הבאים לגלריה המלאה. כל הרגעים היפים מהאירוע במקום אחד.'
              : 'ברוכים הבאים לגלריה הרשמית. כאן תוכלו למצוא את כל הרגעים היפים מהאירוע.'}
          </p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10 pb-20">

        {/* Guest Mode: Landing State */}
        {mode === 'guest' && viewState === 'landing' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-16 text-center max-w-2xl mx-auto border border-slate-100">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-cyan-50/50">
              <Search className="w-10 h-10 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">מצא את התמונות שלי</h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
              העלה תמונת סלפי קצרה, והמערכת החכמה שלנו תמצא את כל התמונות שלך מהאירוע תוך שניות.
            </p>

            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <label className="bg-cyan-500 text-white py-4 px-8 rounded-2xl font-bold text-lg cursor-pointer hover:bg-cyan-600 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-3">
                <Camera className="w-6 h-6" />
                <span>העלה סלפי לחיפוש</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                פרטיות מובטחת. התמונה משמשת לחיפוש בלבד.
              </p>
            </div>
          </div>
        )}

        {/* Guest Mode: Scanning State */}
        {mode === 'guest' && viewState === 'scanning' && (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-slate-100">
            <div className="relative w-32 h-32 mx-auto mb-8">
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selfie"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl relative z-10"
                />
              )}
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 border border-cyan-200 rounded-full animate-spin border-t-cyan-500"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 animate-pulse text-slate-900">מחפש אותך בתמונות...</h2>
            <p className="text-slate-500">סורק אלפי תמונות באמצעות בינה מלאכותית</p>
          </div>
        )}

        {/* Results State */}
        {viewState === 'results' && (
          <div ref={resultsRef} className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8 mt-12 px-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  {mode === 'full' ? 'כל התמונות' : 'התמונות שלך'}
                  <span className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full font-medium">
                    {photos.length}
                  </span>
                </h2>
              </div>
              <button
                onClick={handleDownloadAll}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">הורד הכל</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className="group relative aspect-[2/3] bg-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt="Event"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none select-none">
                    <div className="transform -rotate-45 text-white font-bold text-2xl border-2 border-white px-4 py-1 rounded-lg">
                      {photographer?.name || 'PREVIEW'}
                    </div>
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                    <div className="flex gap-3 justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={(e) => handleDownload(photo, e)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-slate-900 transition-colors shadow-lg"
                        title="הורד תמונה"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleShare(photo, e)}
                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-slate-900 transition-colors shadow-lg"
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
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">לא נמצאו תמונות</h3>
                {mode === 'guest' ? (
                  <>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6">
                      לא הצלחנו למצוא תמונות תואמות. נסה להעלות תמונה אחרת.
                    </p>
                    <button
                      onClick={() => setViewState('landing')}
                      className="text-cyan-600 font-bold hover:text-cyan-700 hover:underline"
                    >
                      נסה שוב
                    </button>
                  </>
                ) : (
                  <p className="text-slate-500 max-w-xs mx-auto">
                    הגלריה ריקה כרגע.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-3 font-medium tracking-wide uppercase">צולם באהבה על ידי</p>
          <h3 className="text-2xl font-bold text-slate-900 mb-8">{photographer?.name}</h3>
          <div className="flex justify-center gap-4 mb-10">
            {photographer?.portfolio?.slice(0, 3).map((file, i) => (
              <div key={i} className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                  תיק עבודות
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs">
            © כל הזכויות שמורות ל{photographer?.name}. נבנה באמצעות <span className="font-bold text-slate-600">Click2Pic</span>.
          </p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-50 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-full max-h-full">
            <img
              src={lightboxPhoto.url}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Lightbox Actions */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={(e) => handleDownload(lightboxPhoto, e)}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all font-medium border border-white/10"
              >
                <Download className="w-5 h-5" />
                <span>הורד</span>
              </button>
              <button
                onClick={(e) => handleShare(lightboxPhoto, e)}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all font-medium border border-white/10"
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