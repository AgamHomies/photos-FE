import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { CONFIG } from '../../config';
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
  CheckCircle2,
  Facebook,
  XCircle,
  Globe
} from 'lucide-react';

interface GalleryPageProps {
  mode?: 'guest' | 'full';
}

const GalleryPage: React.FC<GalleryPageProps> = ({ mode: propMode }) => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'guest' | 'full'>(propMode || 'guest');

  const [viewState, setViewState] = useState<'landing' | 'scanning' | 'results'>('landing');

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 50;

  const resultsRef = useRef<HTMLDivElement>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      // First fetch the event to get the real numeric ID
      const eventData = await BackendService.getEvent(eventId);

      if (eventData) {
        setEvent(eventData);

        // Determine mode from event data if available
        const currentMode = eventData.mode || propMode || 'guest';
        setMode(currentMode);

        // Now fetch photos using the real numeric ID
        const eventPhotos = await BackendService.getEventPhotos(eventData.id, 1, ITEMS_PER_PAGE);

        if (eventData.photographerId) {
          const profile = await BackendService.getPhotographerProfile(eventData.photographerId);
          setPhotographer(profile);
        }

        if (currentMode === 'full') {
          setPhotos(eventPhotos);
          setPage(1);
          setHasMore(eventPhotos.length === ITEMS_PER_PAGE);
          setViewState('results');
        } else {
          setViewState('landing');
        }
      }
    } catch (error) {
      console.error("Failed to load gallery data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (!event || !hasMore) return;

    try {
      const nextPage = page + 1;
      const newPhotos = await BackendService.getEventPhotos(event.id, nextPage, ITEMS_PER_PAGE);

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        setPage(nextPage);
        setHasMore(newPhotos.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more photos", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setViewState('scanning');
      performFaceSearch(e.target.files[0]);
    }
  };

  const performFaceSearch = async (selfieFile: File) => {
    try {
      if (!id) {
        console.error('No event ID available');
        return;
      }

      // Call the real face search API
      const matches = await BackendService.searchFaces(id, selfieFile);

      setPhotos(matches);
      setViewState('results');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Face search failed:', error);
      alert('חיפוש הפנים נכשל. אנא נסה שוב.');
      setViewState('landing');
    }
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
      // Use the new download endpoint
      const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${id}/images/${photo.id}/download-url`);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const data = await response.json();

      // Trigger download via link
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct URL if backend fails
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `photo-${photo.id}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;

    // If photos are selected, download only selected ones
    const photosToDownload = selectedPhotos.size > 0
      ? photos.filter(p => selectedPhotos.has(p.id))
      : photos;

    if (mode === 'full' && selectedPhotos.size === 0) {
      // Full mode with no selection - download all from server
      window.location.href = `${CONFIG.API_BASE_URL}/public/events/${id}/download-all`;
    } else {
      // Guest mode or selected photos
      const imageIds = photosToDownload.map(p => parseInt(p.id));

      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${id}/download-zip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_ids: imageIds })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'photos.zip';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          alert('שגיאה ביצירת קובץ ההורדה');
        }
      } catch (e) {
        console.error(e);
        alert('שגיאה בהורדה');
      }
    }
  };

  const handleSavePhone = async () => {
    if (photographer?.phone) {
      try {
        await navigator.clipboard.writeText(photographer.phone);
        setToastMessage(`המספר ${photographer.phone} הועתק ללוח`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Track the contact save
        if (id) {
          await BackendService.trackContactSaved(id);
        }
      } catch (error) {
        console.error('Failed to copy phone:', error);
        setToastMessage('שגיאה בהעתקת המספר');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } else {
      setToastMessage('מספר טלפון לא זמין');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSocialClick = async (url: string, source: string) => {
    if (!url) return;

    // Track the social media click
    if (id) {
      await BackendService.trackTrafficSource(id, source);
    }

    // Show toast notification
    setToastMessage(`פתיחת ${source}...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    // Open the link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const selectAllPhotos = () => {
    const allPhotoIds = new Set(photos.map(p => p.id));
    setSelectedPhotos(allPhotoIds);
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EB]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#C4A882] mx-auto mb-4" />
          <p className="text-[#8B7355]">טוען גלריה...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-[#8B7355]">אירוע לא נמצא</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] font-sans text-[#5C4A3A]" dir="rtl">

      {/* Photographer Branding Header */}
      <header className="bg-[#FAF8F5] border-b border-[#E8DFD3] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-center">
          <h2 className="font-bold text-base text-[#5C4A3A]">{photographer?.name || 'הצלם שלך'}</h2>
        </div>
      </header>

      {/* Hero / Welcome Message */}
      <div className="relative bg-[#A89680] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#A89680] via-[#A89680]/50 to-transparent"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-6 text-center">
          {/* Photographer Branding */}
          <div className="mb-5">
            {photographer?.profileImageUrl ? (
              <img
                src={photographer.profileImageUrl}
                alt="Photographer Logo"
                className="w-14 h-14 md:w-18 md:h-18 mx-auto mb-3 rounded-2xl object-cover shadow-xl border-3 border-white/20"
              />
            ) : (
              <div className="w-14 h-14 md:w-18 md:h-18 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border-3 border-white/20">
                <Camera className="w-7 h-7 md:w-9 md:h-9 text-white/50" />
              </div>
            )}
            <h1 className="text-lg md:text-2xl font-bold mb-1.5 text-white leading-tight">
              {photographer?.name || 'הצלם שלך'}
            </h1>
            <p className="text-white/70 text-[11px] md:text-xs tracking-widest uppercase font-light">
              PHOTOGRAPHY STUDIO
            </p>
          </div>

          {/* Social Media Buttons */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {photographer?.instagramUrl && (
              <button
                onClick={() => handleSocialClick(photographer.instagramUrl!, 'instagram')}
                className="p-2 text-white/70 hover:text-pink-400 transition-colors bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-pink-400/50"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
            )}
            {photographer?.tiktokUrl && (
              <button
                onClick={() => handleSocialClick(photographer.tiktokUrl!, 'tiktok')}
                className="p-2 text-white/70 hover:text-white transition-colors bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-white/50"
                title="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </button>
            )}
            {photographer?.facebookUrl && (
              <button
                onClick={() => handleSocialClick(photographer.facebookUrl!, 'facebook')}
                className="p-2 text-white/70 hover:text-blue-400 transition-colors bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-blue-400/50"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10 pb-20">

        {/* Guest Mode: Landing State */}
        {mode === 'guest' && viewState === 'landing' && (
          <div className="bg-[#FAF8F5] rounded-3xl shadow-xl p-8 md:p-16 text-center max-w-2xl mx-auto border border-[#E8DFD3] mt-20">
            <div className="w-20 h-20 bg-[#F5E6D3] rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-[#F5E6D3]/50">
              <Search className="w-10 h-10 text-[#C4A882]" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#5C4A3A]">מצא את התמונות שלי</h2>
            <p className="text-[#8B7355] mb-10 max-w-md mx-auto text-lg leading-relaxed">
              העלה תמונת סלפי קצרה, והמערכת החכמה שלנו תמצא את כל התמונות שלך מהאירוע תוך שניות.
            </p>

            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <label className="bg-[#C4A882] text-white py-4 px-8 rounded-2xl font-bold text-lg cursor-pointer hover:bg-[#B39872] transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[#C4A882]/30 flex items-center justify-center gap-3">
                <Camera className="w-6 h-6" />
                <span>העלה סלפי לחיפוש</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-[#A89680] mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                פרטיות מובטחת. התמונה משמשת לחיפוש בלבד.
              </p>
            </div>
          </div>
        )}

        {/* Guest Mode: Scanning State */}
        {mode === 'guest' && viewState === 'scanning' && (
          <div className="bg-[#FAF8F5] rounded-3xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-[#E8DFD3] mt-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selfie"
                  className="w-full h-full object-cover rounded-full border-4 border-[#FAF8F5] shadow-xl relative z-10"
                />
              )}
              <div className="absolute inset-0 border-4 border-[#C4A882] rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 border border-[#E8DFD3] rounded-full animate-spin border-t-[#C4A882]"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2 animate-pulse text-[#5C4A3A]">מחפש אותך בתמונות...</h2>
            <p className="text-[#8B7355]">סורק אלפי תמונות באמצעות בינה מלאכותית</p>
          </div>
        )}

        {/* Event Details - Just Above Gallery */}
        {viewState === 'results' && (
          <div className="bg-[#FAF8F5] rounded-2xl shadow-sm border border-[#E8DFD3] py-5 px-5 text-center mb-8 mt-20">
            <h1 className="text-xl md:text-2xl font-bold mb-3 leading-tight tracking-tight text-[#5C4A3A]">{event.name}</h1>
            <div className="flex items-center justify-center gap-3 text-[#8B7355] text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C4A882]" />
                <span className="font-medium">{new Date(event.date).toLocaleDateString('he-IL')}</span>
              </div>
              <span className="w-1 h-1 bg-[#D4C4B0] rounded-full"></span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C4A882]" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {viewState === 'results' && (
          <div ref={resultsRef} className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-2 gap-4 md:gap-0">
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <h2 className="text-2xl font-bold text-[#5C4A3A] flex items-center gap-3">
                  {mode === 'full' ? 'כל התמונות' : 'התמונות שלך'}
                  <span className="bg-[#EAE2D6] text-[#8B7355] text-sm px-3 py-1 rounded-full font-medium">
                    {mode === 'full' ? (event?.photoCount || photos.length) : photos.length}
                  </span>
                </h2>

                {/* Selection Counter - Show next to title on mobile too */}
                {selectedPhotos.size > 0 && (
                  <div className="bg-[#C4A882] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedPhotos.size} נבחרו</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* Clear Selection Button - Rightmost in RTL */}
                <div className="w-[140px] flex justify-end">
                  {selectedPhotos.size > 0 && (
                    <button
                      onClick={deselectAllPhotos}
                      className="bg-[#FAF8F5] border border-[#D4C4B0] text-[#8B7355] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5F1EB] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full animate-fade-in"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>נקה בחירה</span>
                    </button>
                  )}
                </div>

                {/* Select All Button - Middle */}
                {photos.length > 0 && (
                  <button
                    onClick={selectAllPhotos}
                    disabled={selectedPhotos.size === photos.length}
                    className={`w-[130px] border px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${selectedPhotos.size === photos.length
                      ? 'bg-[#F5F1EB] border-transparent text-[#D4C4B0] cursor-default'
                      : 'bg-[#FAF8F5] border-[#D4C4B0] text-[#8B7355] hover:bg-[#F5F1EB] hover:shadow-md'
                      }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>בחר הכל</span>
                  </button>
                )}

                <button
                  onClick={handleDownloadAll}
                  className="bg-[#8B7355] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#6F5940] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[170px]"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {selectedPhotos.size > 0 ? `הורד ${selectedPhotos.size} נבחרו` : 'הורד הכל'}
                  </span>
                  <span className="sm:hidden">הורד</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`group relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:z-10 transform-gpu ${isSelected ? 'shadow-md' : ''}`}
                  >
                    <img
                      src={photo.url}
                      alt="Event"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onClick={() => setLightboxPhoto(photo)}
                    />

                    {/* Selection Checkmark - Top Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      className={`absolute top-3 right-3 z-20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 ${isSelected
                        ? 'bg-white text-black shadow-lg scale-100 opacity-100'
                        : 'bg-black/20 text-white/50 hover:bg-white/90 hover:text-black hover:scale-105 opacity-0 group-hover:opacity-100'
                        }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 fill-none" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/70" />
                      )}
                    </button>

                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none select-none">
                      <div className="transform -rotate-45 text-white font-bold text-2xl border-2 border-white px-4 py-1 rounded-lg">
                        {photographer?.name || 'PREVIEW'}
                      </div>
                    </div>

                    {/* Action Buttons - Top Left */}
                    <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        onClick={(e) => handleDownload(photo, e)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm text-[#8B7355] rounded-xl hover:bg-white hover:text-[#C4A882] transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                        title="הורד תמונה"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleShare(photo, e)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm text-[#8B7355] rounded-xl hover:bg-white hover:text-[#C4A882] transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                        title="שתף"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More handled in footer or auto-scroll (cleaning up old button) */}

            {
              photos.length === 0 && (
                <div className="text-center py-24 bg-[#FAF8F5] rounded-3xl border border-[#E8DFD3] shadow-sm">
                  <div className="w-20 h-20 bg-[#F5F1EB] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-[#D4C4B0]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5C4A3A] mb-2">לא נמצאו תמונות</h3>
                  {mode === 'guest' ? (
                    <>
                      <p className="text-[#8B7355] max-w-xs mx-auto mb-6">
                        לא הצלחנו למצוא תמונות תואמות. נסה להעלות תמונה אחרת.
                      </p>
                      <button
                        onClick={() => setViewState('landing')}
                        className="text-[#C4A882] font-bold hover:text-[#B39872] hover:underline"
                      >
                        נסה שוב
                      </button>
                    </>
                  ) : (
                    <p className="text-[#8B7355] max-w-xs mx-auto">
                      הגלריה ריקה כרגע.
                    </p>
                  )}
                </div>
              )
            }
          </div >
        )}
      </div >

      {/* Footer */}
      {/* Footer / Call to Action */}
      <footer className="bg-[#EAE2D6]/30 border-t border-[#E8DFD3] py-16 mt-20">
        <div className="max-w-2xl mx-auto px-6 text-center">

          <h3 className="text-2xl font-bold text-[#5C4A3A] mb-2">אהבתם את התמונות?</h3>
          <p className="text-[#8B7355] mb-8 font-medium">חכו שתראו איך נצלם את האירוע שלכם :)</p>
          <p className="text-xs text-[#A89680] mb-8">שמרו את הפרטים שלנו או עברו לאתר שלנו לפרטים נוספים</p>

          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {/* Save Phone Button */}
            <button
              onClick={handleSavePhone}
              className="w-full bg-[#C4A882] text-white py-4 rounded-full text-lg font-bold shadow-sm hover:bg-[#B39872] transition-colors flex items-center justify-center gap-3"
            >
              <span>שמור מספר טלפון</span>
              <Phone className="w-5 h-5" />
            </button>

            {/* Website Button */}
            {photographer?.websiteUrl && (
              <button
                onClick={() => window.open(photographer.websiteUrl, '_blank')}
                className="w-full bg-white text-[#5C4A3A] border border-[#E8DFD3] py-4 rounded-full text-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
              >
                <span>מעבר לאתר הצלם</span>
                <Globe className="w-5 h-5" />
              </button>
            )}

            {/* Pages / Load More (If in full mode and exists) */}
            {hasMore && mode === 'full' && (
              <div className="mt-4">
                <button
                  onClick={loadMorePhotos}
                  className="text-[#C4A882] font-bold hover:underline"
                >
                  טען עוד תמונות
                </button>
              </div>
            )}

          </div>

          <div className="mt-16 pt-8 border-t border-[#E8DFD3]/50">
            <p className="text-[#A89680] text-xs">
              Powered by <span className="font-bold text-[#C4A882]">Click2Pic</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {
        lightboxPhoto && (
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
        )
      }

      {/* Toast Notification */}
      {
        showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-[#8B7355] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C4E8C4]" />
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default GalleryPage;