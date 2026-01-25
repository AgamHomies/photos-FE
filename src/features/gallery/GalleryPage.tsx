import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
   Loader2,
   X,
   CheckCircle2,
   Facebook,
   Globe,
   Heart,
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
   RefreshCw
} from 'lucide-react';
import { Toast } from '../../components';
import { SortingControl } from './components/SortingControl';
import { getThemeByColor, BORDER_RADIUS_MAP } from '../../utils/galleryThemes';

// Lightbox Component to handle scroll locking and backdrop click
const LightboxOverlay: React.FC<{
   photo: Photo;
   onClose: () => void;
   onNext: (e?: React.MouseEvent) => void;
   onPrev: (e?: React.MouseEvent) => void;
   onDownload: (photo: Photo, e?: React.MouseEvent) => void;
   onShare: (photo: Photo, e: React.MouseEvent) => void;
   hasNext: boolean;
   hasPrev: boolean;
}> = ({ photo, onClose, onNext, onPrev, onDownload, onShare, hasNext, hasPrev }) => {

   // Lock body scroll
   useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, []);

   return (
      <div
         className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in text-white/90"
         onClick={onClose} // Close on backdrop click
      >
         <button
            onClick={(e) => {
               e.stopPropagation();
               onClose();
            }}
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-[60]"
         >
            <X className="w-8 h-8" />
         </button>

         <img
            src={photo.url}
            alt="Full view"
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
         />

         {/* Navigation Buttons */}
         <button
            onClick={(e) => {
               e.stopPropagation();
               onNext(e);
            }}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10 z-[60] ${!hasNext ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={!hasNext}
            title="הבא"
         >
            <ChevronLeft className="w-8 h-8" />
         </button>

         <button
            onClick={(e) => {
               e.stopPropagation();
               onPrev(e);
            }}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10 z-[60] ${!hasPrev ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={!hasPrev}
            title="הקודם"
         >
            <ChevronRight className="w-8 h-8" />
         </button>

         <div
            className="absolute bottom-8 flex gap-6 z-[60]"
            onClick={(e) => e.stopPropagation()}
         >
            <button onClick={(e) => onDownload(photo, e)} className="text-white flex flex-col items-center gap-1 hover:text-[#C4A882] transition-colors">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Download className="w-6 h-6" />
               </div>
               <span className="text-xs font-medium">הורד</span>
            </button>
            <button onClick={(e) => onShare(photo, e)} className="text-white flex flex-col items-center gap-1 hover:text-[#C4A882] transition-colors">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Share2 className="w-6 h-6" />
               </div>
               <span className="text-xs font-medium">שתף</span>
            </button>
         </div>
      </div>
   );
};

interface GalleryPageProps {
   mode?: 'guest' | 'full';
}

const GalleryPage: React.FC<GalleryPageProps> = ({ mode: propMode }) => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [event, setEvent] = useState<Event | null>(null);
   const eventRef = useRef<Event | null>(null); // Ref to access event inside closures without dependencies

   // Sync ref with state
   useEffect(() => {
      eventRef.current = event;
   }, [event]);

   const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
   const [loading, setLoading] = useState(true);
   const [mode, setMode] = useState<'guest' | 'full'>(propMode || 'guest');

   const [viewState, setViewState] = useState<'landing' | 'scanning' | 'results'>('landing');

   const [selectedImage, setSelectedImage] = useState<File | null>(null);
   const [photos, setPhotos] = useState<Photo[]>([]);
   const [searchResults, setSearchResults] = useState<Photo[]>([]); // Store all search results for client-side pagination
   const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
   const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

   // Pagination State
   const [page, setPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(12); // Default for desktop

   // Calculate total pages based on mode
   const totalItems = mode === 'full' ? (event?.photoCount || 0) : (viewState === 'results' ? searchResults.length : 0);
   const totalPages = Math.ceil(totalItems / itemsPerPage);

   const resultsRef = useRef<HTMLDivElement>(null);

   // Responsive itemsPerPage logic
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 768) {
            setItemsPerPage(6); // Mobile: 2 cols * 3 rows = 6
         } else if (window.innerWidth < 1024) {
            setItemsPerPage(9); // Tablet: 3 cols * 3 rows = 9
         } else {
            setItemsPerPage(12); // Desktop: 4 cols * 3 rows = 12
         }
      };

      // Initial call
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   const [sortBy, setSortBy] = useState<'time' | 'matchScore'>('matchScore');

   // Sort search results based on active sort mode
   const sortedSearchResults = React.useMemo(() => {
      if (viewState !== 'results') return [];

      const sorted = [...searchResults];
      if (sortBy === 'matchScore') {
         sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } else {
         // Sort by time (takenAt)
         sorted.sort((a, b) => {
            const timeA = a.takenAt ? new Date(a.takenAt).getTime() : 0;
            const timeB = b.takenAt ? new Date(b.takenAt).getTime() : 0;
            // Handle NaN
            const valA = isNaN(timeA) ? 0 : timeA;
            const valB = isNaN(timeB) ? 0 : timeB;
            return valA - valB;
         });
      }
      return sorted;
   }, [searchResults, sortBy, viewState]);

   // Reset to page 1 when sorting changes
   useEffect(() => {
      setPage(1);
   }, [sortBy]);

   // Update displayed photos when page, itemsPerPage, or searchResults change
   useEffect(() => {
      if (mode === 'full') return; // In full mode, photos are controlled by manual fetches

      if (viewState === 'results') {
         // Client-side pagination for results
         const start = (page - 1) * itemsPerPage;
         const end = start + itemsPerPage;
         setPhotos(sortedSearchResults.slice(start, end));
      }
   }, [page, itemsPerPage, sortedSearchResults, viewState, mode, event]);

   // Toast notification state
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState('');
   const [toastType, setToastType] = useState<'success' | 'error'>('success');

   const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
   };

   useEffect(() => {
      if (id) {
         loadData(id);
      }
   }, [id]);

   // Deep Linking: Open photo if photoId is in URL
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const rawPhotoId = params.get('photoId');
      const photoId = rawPhotoId ? rawPhotoId.split(':')[0] : null;

      if (photoId) {
         const openDeepLinkedPhoto = async () => {
            // 1. Clear the URL param immediately to prevent re-triggering
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('photoId');
            const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
            window.history.replaceState({}, '', newUrl);

            // If photo is already in photos array (e.g. page 1), use it
            const existingPhoto = photos.find(p => p.id === photoId);
            if (existingPhoto) {
               setLightboxPhoto(existingPhoto);
               return;
            }

            // Otherwise fetch it specifically
            try {
               const photoData = await BackendService.getPublicPhoto(photoId);
               if (photoData) {
                  setLightboxPhoto(photoData);
               }
            } catch (err) {
               console.error("Failed to load deep linked photo", err);
            }
         };

         if (!loading) {
            openDeepLinkedPhoto();
         }
      }
   }, [loading, photos]);

   // Handle Shared Selection Deep Link
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const rawSelectionId = params.get('selectionId');
      const selectionId = rawSelectionId ? rawSelectionId.split(':')[0] : null;

      if (selectionId && id) {
         const loadSelection = async () => {
            setLoading(true);
            try {
               const newParams = new URLSearchParams(window.location.search);
               newParams.delete('selectionId');
               const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
               window.history.replaceState({}, '', newUrl);

               const selectedPhotos = await BackendService.getSelection(id, selectionId);
               setPhotos(selectedPhotos);

               if (selectedPhotos.length > 0) {
                  setLightboxPhoto(selectedPhotos[0]);
               }

               setViewState('landing');
            } catch (err) {
               console.error("Failed to load selection", err);
               triggerToast('טעינת הבחירה נכשלה', 'error');
            } finally {
               if (eventRef.current) {
                  setLoading(false);
               }
            }
         };
         loadSelection();
      }
   }, [id]);

   const loadData = async (eventId: string) => {
      const initialParams = new URLSearchParams(window.location.search);
      const hasSelectionId = !!initialParams.get('selectionId');

      try {
         const eventData = await BackendService.getEvent(eventId);

         if (eventData) {
            setEvent(eventData);
            let currentMode = eventData.mode || propMode || 'guest';
            if (eventData.coupleSlug === eventId) {
               currentMode = 'full';
            }

            setMode(currentMode);

            if (eventData.photographerId) {
               try {
                  const profile = await BackendService.getPhotographerProfile(eventData.photographerId);
                  setPhotographer(profile);
               } catch (err) {
                  console.error('Error fetching photographer profile:', err);
               }
            }

            if (!hasSelectionId) {
               if (currentMode === 'full') {
                  const savedPage = sessionStorage.getItem(`gallery_page_${eventId}`);
                  const startPage = savedPage ? parseInt(savedPage) : 1;
                  setPage(startPage);

                  const eventPhotos = await BackendService.getEventPhotos(eventData.id, startPage, itemsPerPage);
                  setPhotos(eventPhotos);
                  setViewState('results');
               } else {
                  const viewParam = initialParams.get('view');
                  if (viewParam === 'results') {
                     try {
                        const savedResults = sessionStorage.getItem(`guest_results_${eventId}`);
                        if (savedResults) {
                           const parsedResults = JSON.parse(savedResults);
                           setSearchResults(parsedResults);
                           setViewState('results');
                           setSortBy('matchScore');

                           const savedPage = sessionStorage.getItem(`gallery_page_${eventId}`);
                           if (savedPage) {
                              setPage(parseInt(savedPage));
                           }
                        } else {
                           setViewState('landing');
                           const newUrl = window.location.pathname;
                           window.history.replaceState({}, '', newUrl);
                        }
                     } catch (e) {
                        console.error('Failed to parse saved results', e);
                        setViewState('landing');
                     }
                  } else {
                     setViewState('landing');
                  }
               }
            }
         }
      } catch (error) {
         console.error("Failed to load gallery data", error);
      } finally {
         setLoading(false);
      }
   };

   const handlePageChange = async (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;

      if (mode === 'full' && event) {
         setLoading(true);
         try {
            sessionStorage.setItem(`gallery_page_${event.id}`, newPage.toString());
            const newPhotos = await BackendService.getEventPhotos(event.id, newPage, itemsPerPage);
            setPhotos(newPhotos);
            setPage(newPage);
         } catch (error) {
            console.error("Failed to change page", error);
         } finally {
            setLoading(false);
         }
      } else if (viewState === 'results') {
         if (id) {
            sessionStorage.setItem(`gallery_page_${id}`, newPage.toString());
         }
         setPage(newPage);
         // Client-side pagination updated by useEffect
      }
   };

   const resizeImage = (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
         const img = new Image();
         img.src = URL.createObjectURL(file);

         img.onload = () => {
            const maxWidth = 1200;
            const maxHeight = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
               if (width > height) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
               } else {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
               }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
               reject(new Error('Failed to get canvas context'));
               return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
               if (!blob) {
                  reject(new Error('Failed to create blob'));
                  return;
               }
               const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
               });
               resolve(resizedFile);
            }, 'image/jpeg', 0.8);
         };

         img.onerror = (error) => reject(error);
      });
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const originalFile = e.target.files[0];
         setViewState('scanning');
         setSelectedImage(originalFile);

         try {
            const resizedFile = await resizeImage(originalFile);
            performFaceSearch(resizedFile);
         } catch (error) {
            console.error('Error resizing image:', error);
            triggerToast('שגיאה בעיבוד התמונה', 'error');
            setViewState('landing');
         }
      }
   };

   const clearSearch = () => {
      setViewState('landing');
      setSearchResults([]);
      setPhotos([]);
      if (id) {
         sessionStorage.removeItem(`guest_results_${id}`);
      }
      const newUrl = window.location.pathname;
      window.history.pushState({}, '', newUrl);
   };

   const performFaceSearch = async (selfieFile: File) => {
      try {
         if (!id) return;

         const matches = await BackendService.searchFaces(id, selfieFile);
         setSearchResults(matches);
         setSortBy('matchScore');
         setPage(1);
         setViewState('results');

         sessionStorage.setItem(`guest_results_${id}`, JSON.stringify(matches));
         const newUrl = `${window.location.pathname}?view=results`;
         window.history.pushState({}, '', newUrl);

         setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
         }, 100);
      } catch (error) {
         console.error('Face search failed:', error);
         triggerToast('חיפוש הפנים נכשל. אנא נסה שוב.', 'error');
         setViewState('landing');
      }
   };

   const handleShare = async (photo: Photo, e: React.MouseEvent) => {
      e.stopPropagation();
      let shareUrl = `${window.location.origin}/share/photo/${photo.id}?url=${encodeURIComponent(photo.url)}&event=${encodeURIComponent(event?.name || 'אירוע')}&title=${encodeURIComponent(photo.title || 'תמונה מהאירוע')}`;

      try {
         const publicPhoto = await BackendService.getPublicPhoto(photo.id);
         if (publicPhoto && publicPhoto.shareLink) {
            shareUrl = publicPhoto.shareLink;
         }
      } catch (err) {
         console.error('Failed to get smart share link', err);
      }

      const unsecuredCopyToClipboard = (text: string) => {
         const textArea = document.createElement("textarea");
         textArea.value = text;
         textArea.style.position = "fixed";
         textArea.style.left = "-9999px";
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();
         try {
            document.execCommand('copy');
            triggerToast('הקישור לתמונה הועתק ללוח');
         } catch (err) {
            console.error('Fallback copy failed', err);
            window.prompt("העתק את הקישור:", text);
         }
         document.body.removeChild(textArea);
      };

      if (navigator.share) {
         try {
            await navigator.share({
               title: 'תמונה מהאירוע',
               text: `תמונה מהאירוע ${event?.name}`,
               url: shareUrl,
            });
         } catch (error) {
            console.log('Error sharing', error);
         }
      } else {
         if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
               .then(() => triggerToast('הקישור לתמונה הועתק ללוח'))
               .catch(() => unsecuredCopyToClipboard(shareUrl));
         } else {
            unsecuredCopyToClipboard(shareUrl);
         }
      }
   };

   const handleShareSelection = async () => {
      if (selectedPhotos.size === 0 || !id) return;
      const imageIds = Array.from(selectedPhotos).map(id => parseInt(id));

      try {
         const result = await BackendService.shareSelection(id, imageIds);
         const shareUrl = result.shareLink;
         const shareTitle = `${selectedPhotos.size} תמונות מ${event?.name || 'האירוע'}`;

         if (navigator.share) {
            try {
               await navigator.share({
                  title: shareTitle,
                  text: `לחצו לצפייה ב-${selectedPhotos.size} תמונות שבחרתי`,
                  url: shareUrl,
               });
            } catch (error) {
               console.log('Error sharing', error);
            }
         } else {
            const unsecuredCopyToClipboard = (text: string) => {
               const textArea = document.createElement("textarea");
               textArea.value = text;
               textArea.style.position = "fixed";
               textArea.style.left = "-9999px";
               document.body.appendChild(textArea);
               textArea.select();
               try {
                  document.execCommand('copy');
                  triggerToast('הקישור לאוסף הועתק ללוח');
               } catch (err) {
                  console.error('Fallback copy failed', err);
                  window.prompt("העתק את הקישור:", text);
               }
               document.body.removeChild(textArea);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
               navigator.clipboard.writeText(shareUrl)
                  .then(() => triggerToast('הקישור לאוסף הועתק ללוח'))
                  .catch(() => unsecuredCopyToClipboard(shareUrl));
            } else {
               unsecuredCopyToClipboard(shareUrl);
            }
         }
      } catch (error) {
         console.error('Failed to share selection:', error);
         triggerToast('יצירת הקישור נכשלה', 'error');
      }
   };

   useEffect(() => {
      if (!lightboxPhoto) return;

      const handleKeyDown = (e: KeyboardEvent) => {
         const navArray = viewState === 'results' ? searchResults : photos;
         const currentIndex = navArray.findIndex(p => p.id === lightboxPhoto.id);

         if (e.key === 'ArrowLeft') {
            if (currentIndex < navArray.length - 1) {
               setLightboxPhoto(navArray[currentIndex + 1]);
            }
         } else if (e.key === 'ArrowRight') {
            if (currentIndex > 0) {
               setLightboxPhoto(navArray[currentIndex - 1]);
            }
         } else if (e.key === 'Escape') {
            setLightboxPhoto(null);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [lightboxPhoto, photos, searchResults, viewState]);

   const handleNextPhoto = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!lightboxPhoto) return;
      const navArray = viewState === 'results' ? searchResults : photos;
      const currentIndex = navArray.findIndex(p => p.id === lightboxPhoto.id);
      if (currentIndex < navArray.length - 1) {
         setLightboxPhoto(navArray[currentIndex + 1]);
      }
   };

   const handlePrevPhoto = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!lightboxPhoto) return;
      const navArray = viewState === 'results' ? searchResults : photos;
      const currentIndex = navArray.findIndex(p => p.id === lightboxPhoto.id);
      if (currentIndex > 0) {
         setLightboxPhoto(navArray[currentIndex - 1]);
      }
   };

   const handleDownload = async (photo: Photo, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      try {
         const response = await fetch(`${CONFIG.API_BASE_URL}/public/events/${id}/images/${photo.id}/download-url`);
         if (!response.ok) throw new Error('Download failed');

         const data = await response.json();
         const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
         const isMobile = /Android/i.test(navigator.userAgent) || isIOS;

         // Navigate to download page in same tab (allows back button)
         window.location.href = `/gallery/${id}/download?photoId=${photo.id}`;
      } catch (error) {
         console.error('Download error:', error);
         const win = window.open(photo.url, '_blank');
         if (!win) {
            triggerToast('ההורדה נחסמה. אנא אפשר חלונות קופצים או נסה לחיצה ארוכה.', 'error');
         } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            triggerToast('לחץ לחיצה ארוכה על התמונה ושמור אותה.', 'success');
         }
      }
   };

   const handleDownloadAll = async () => {
      if (photos.length === 0) return;

      // If photos are selected, redirect to download page for review
      if (selectedPhotos.size > 0) {
         // Track downloads when user clicks download button (not when they click ZIP)
         if (id) {
            try {
               await BackendService.trackDownloads(id, selectedPhotos.size);
            } catch (error) {
               console.error('Failed to track downloads:', error);
            }
         }

         const photoIds = Array.from(selectedPhotos).join(',');
         navigate(`/gallery/${id}/download?photoIds=${photoIds}`);
         return;
      }

      // Download all photos immediately (full mode only)
      if (mode === 'full') {
         window.location.href = `${CONFIG.API_BASE_URL}/public/events/${id}/download-all`;
      }
   };

   const handleSavePhone = async () => {
      if (!photographer?.phone) return;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
         const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${photographer.name}
TEL;TYPE=CELL:${photographer.phone}
END:VCARD`;

         const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `${photographer.name}.vcf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
      } else {
         try {
            await navigator.clipboard.writeText(photographer.phone);
            triggerToast(`המספר ${photographer.phone} הועתק ללוח`);
         } catch (error) {
            console.error('Failed to copy phone:', error);
         }
      }

      if (id) await BackendService.trackContactSaved(id);
   };

   const handleSocialClick = async (url: string, source: string) => {
      if (!url) return;
      if (id) await BackendService.trackTrafficSource(id, source);
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
         <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
            <div className="text-center">
               <Loader2 className="w-10 h-10 animate-spin text-[#C4A882] mx-auto mb-4" />
            </div>
         </div>
      );
   }

   if (!event) {
      return <div className="min-h-screen flex items-center justify-center text-[#8B7355]">אירוע לא נמצא</div>;
   }

   const theme = getThemeByColor(event.backgroundColor || '#FDFBF7');
   const borderRadius = BORDER_RADIUS_MAP[theme.borderRadius];

   return (
      <div
         className="min-h-screen font-sans flex flex-col transition-all duration-700"
         dir="rtl"
         style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textPrimary,
            fontFamily: theme.fontFamily
         }}
      >
         {/* 1. Header & Branding */}
         <div
            className="w-full pt-8 pb-8 text-center shadow-sm relative z-10 transition-all duration-700"
            style={{ backgroundColor: theme.headerBackground }}
         >
            <div className="mb-4">
               {photographer?.profileImageUrl ? (
                  <img
                     src={photographer.profileImageUrl}
                     alt="Logo"
                     className="w-20 h-20 mx-auto object-contain bg-transparent"
                     onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                     }}
                  />
               ) : null}
               <div
                  className={`${photographer?.profileImageUrl ? 'hidden' : ''} w-20 h-20 mx-auto flex items-center justify-center transition-all duration-300`}
               >
                  <Camera className="w-8 h-8" style={{ color: theme.accentColor }} />
               </div>
            </div>

            <h1 className="text-3xl font-bold mb-1" style={{ color: theme.primaryColor }}>
               {photographer?.name || 'שם הצלם'}
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: theme.secondaryColor }}>
               PHOTOGRAPHY STUDIO
            </p>

            <div className="flex items-center justify-center gap-5">
               {photographer?.tiktokUrl && (
                  <button onClick={() => handleSocialClick(photographer.tiktokUrl!, 'tiktok')} className="transition-all hover:scale-110 active:scale-95" style={{ color: theme.accentColor }} title="TikTok">
                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                     </svg>
                  </button>
               )}
               {photographer?.facebookUrl && (
                  <button onClick={() => handleSocialClick(photographer.facebookUrl!, 'facebook')} className="transition-all hover:scale-110 active:scale-95" style={{ color: theme.accentColor }} title="Facebook">
                     <Facebook className="w-6 h-6" />
                  </button>
               )}
               {photographer?.instagramUrl && (
                  <button onClick={() => handleSocialClick(photographer.instagramUrl!, 'instagram')} className="transition-all hover:scale-110 active:scale-95" style={{ color: theme.accentColor }} title="Instagram">
                     <Instagram className="w-6 h-6" />
                  </button>
               )}
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-grow w-full flex flex-col items-center py-12" style={{ backgroundColor: theme.backgroundColor }}>

            {/* 2. Main Content Card */}
            {viewState !== 'results' && (() => {
               const layout = event.layout === 'ai' ? 'split' : (event.layout || 'split');

               const LandingPanel = () => (
                  <div className={`flex flex-col justify-center items-center text-center transition-all duration-700 w-full ${layout === 'split' || layout === 'portrait' ? 'md:w-1/2 p-8 md:p-12' : 'p-8 md:p-16'}`} style={{ backgroundColor: layout === 'glass' ? 'transparent' : `${theme.cardBackground}dd` }}>
                     {viewState === 'scanning' ? (
                        <div className="flex flex-col items-center animate-pulse">
                           <div className="relative w-32 h-32 mb-6">
                              {selectedImage && <img src={URL.createObjectURL(selectedImage)} alt="Selfie" className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg" />}
                              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: theme.accentColor }}></div>
                           </div>
                           <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primaryColor }}>מחפש אותך...</h3>
                           <p style={{ color: theme.secondaryColor }}>סורק את התמונות באמצעות AI</p>
                        </div>
                     ) : (
                        <>
                           <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${theme.accentColor}20`, borderRadius }}>
                              <Camera className="w-8 h-8" style={{ color: theme.accentColor }} />
                           </div>
                           <h3 className="text-2xl font-bold mb-3" style={{ color: theme.primaryColor }}>מצאו את התמונות שלכם מהאירוע</h3>
                           <p className="mb-8 max-w-sm leading-relaxed text-sm" style={{ color: theme.secondaryColor }}>
                              העלו סלפי ברור של עצמכם — והמערכת שלנו תזהה אוטומטית ותציג לכם רק את התמונות המדהימות שבהן הופעתם באירוע.
                           </p>
                           <label className="text-white px-8 py-4 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 transform hover:-translate-y-1 w-full max-w-xs justify-center group" style={{ backgroundColor: theme.accentColor, borderRadius }}>
                              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span>העלה סלפי למציאת התמונות</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                           </label>
                           <div className="mt-4 flex items-center gap-2 text-[10px] text-[#A89680]">
                              <span className="w-3 h-3" style={{ color: theme.accentColor }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                              <span>התמונה נמחקת אוטומטית מיד לאחר תהליך הזיהוי.</span>
                           </div>
                        </>
                     )}
                  </div>
               );

               const EventDetails = () => (
                  <div className="text-center py-8 px-6 transition-all duration-700" style={{ borderBottom: layout === 'hero' ? 'none' : `1px solid ${theme.cardBorder}` }}>
                     <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>
                        {mode === 'full' ? 'הגלריה של האירוע' : 'הגלריה שלך מהאירוע'}
                     </h2>
                     <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-medium max-w-2xl mx-auto" style={{ color: theme.secondaryColor }}>
                        <div className="flex items-center gap-1.5">
                           <Heart className="w-4 h-4" style={{ color: theme.accentColor }} />
                           <span>{event.name}</span>
                        </div>
                        <span className="hidden md:inline w-px h-4" style={{ backgroundColor: theme.cardBorder }}></span>
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" style={{ color: theme.accentColor }} />
                           <span>{new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <span className="hidden md:inline w-px h-4" style={{ backgroundColor: theme.cardBorder }}></span>
                        <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />
                           <span>{event.location}</span>
                        </div>
                     </div>
                  </div>
               );

               const CoverImage = ({ className = "" }) => (
                  <div className={`relative overflow-hidden ${className}`}>
                     <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover shadow-inner transition-transform duration-700 hover:scale-105" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
               );

               return (
                  <div className="w-full max-w-5xl mx-auto px-4">
                     <div
                        className="rounded-3xl shadow-xl overflow-hidden transition-all duration-700 relative"
                        style={{
                           backgroundColor: theme.cardBackground,
                           border: layout === 'glass' ? 'none' : `1px solid ${theme.cardBorder}`,
                           borderRadius: borderRadius
                        }}
                     >
                        {layout === 'glass' && (
                           <div className="absolute inset-0 z-0">
                              <img src={event.coverImage} className="w-full h-full object-cover blur-sm scale-110 opacity-40" />
                              <div className="absolute inset-0" style={{ backgroundColor: `${theme.backgroundColor}66` }}></div>
                           </div>
                        )}

                        <div className="relative z-10">
                           {layout === 'split' && (
                              <>
                                 <EventDetails />
                                 <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
                                    <LandingPanel />
                                    <CoverImage className="w-full md:w-1/2 h-64 md:h-full order-1 md:order-2" />
                                 </div>
                              </>
                           )}

                           {layout === 'hero' && (
                              <>
                                 <CoverImage className="w-full h-72 md:h-96" />
                                 <EventDetails />
                                 <div className="p-4 md:pb-12">
                                    <LandingPanel />
                                 </div>
                              </>
                           )}

                           {layout === 'portrait' && (
                              <>
                                 <EventDetails />
                                 <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
                                    <CoverImage className="w-full md:w-2/5 h-80 md:h-full order-1 md:order-2" />
                                    <LandingPanel />
                                 </div>
                              </>
                           )}

                           {layout === 'glass' && (
                              <div className="py-16 md:py-24 px-4 flex flex-col items-center">
                                 <div className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/40 shadow-2xl max-w-2xl w-full">
                                    <EventDetails />
                                    <LandingPanel />
                                 </div>
                              </div>
                           )}

                           {layout === 'minimal' && (
                              <div className="py-12 flex flex-col items-center">
                                 <CoverImage className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-8 border-4 border-white shadow-xl" />
                                 <EventDetails />
                                 <div className="max-w-xl w-full">
                                    <LandingPanel />
                                 </div>
                              </div>
                           )}

                           {layout === 'magazine' && (
                              <div className="flex flex-col md:flex-row min-h-[600px]">
                                 <div className="w-full md:w-1/2 p-12 flex flex-col justify-center order-2 md:order-1">
                                    <div className="border-r-4 pr-6 mb-8" style={{ borderColor: theme.accentColor }}>
                                       <EventDetails />
                                    </div>
                                    <LandingPanel />
                                 </div>
                                 <div className="w-full md:w-1/2 relative min-h-[400px] order-1 md:order-2">
                                    <div className="absolute inset-4 md:inset-12 z-10 shadow-2xl overflow-hidden rounded-lg">
                                       <img src={event.coverImage} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute top-0 right-0 w-2/3 h-2/3 opacity-20" style={{ backgroundColor: theme.accentColor }}></div>
                                 </div>
                              </div>
                           )}

                           {layout === 'full-screen' && (
                              <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
                                 <div className="absolute inset-0 z-0">
                                    <img src={event.coverImage} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40"></div>
                                 </div>
                                 <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 md:p-16 rounded-[40px] border border-white/20 shadow-2xl text-white max-w-3xl mx-4 text-center">
                                    <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">{event.name}</h2>
                                    <div className="flex flex-col gap-4 mb-12 text-xl font-medium">
                                       <div className="flex items-center justify-center gap-3">
                                          <Calendar className="w-6 h-6" />
                                          <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                                       </div>
                                       <div className="flex items-center justify-center gap-3">
                                          <MapPin className="w-6 h-6" />
                                          <span>{event.location}</span>
                                       </div>
                                    </div>
                                    <div className="max-w-md mx-auto">
                                       <LandingPanel />
                                    </div>
                                 </div>
                              </div>
                           )}

                           {layout === 'side-by-side' && (
                              <div className="flex flex-col md:flex-row min-h-[600px] gap-8 p-6 md:p-12">
                                 <div className="w-full md:w-2/5 flex flex-col justify-center text-right">
                                    <div className="mb-12">
                                       <span className="text-sm font-bold uppercase tracking-widest opacity-50 block mb-2" style={{ color: theme.secondaryColor }}>הגלריה הרשמית</span>
                                       <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: theme.primaryColor }}>{event.name}</h2>
                                       <div className="space-y-4" style={{ color: theme.secondaryColor }}>
                                          <div className="flex items-center justify-end gap-3">
                                             <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                                             <Calendar className="w-5 h-5" style={{ color: theme.accentColor }} />
                                          </div>
                                          <div className="flex items-center justify-end gap-3">
                                             <span>{event.location}</span>
                                             <MapPin className="w-5 h-5" style={{ color: theme.accentColor }} />
                                          </div>
                                       </div>
                                    </div>
                                    <LandingPanel />
                                 </div>
                                 <div className="w-full md:w-3/5 min-h-[500px] relative">
                                    <div className="absolute inset-0 bg-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                                       <img src={event.coverImage} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                    </div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-3xl border-8 border-white shadow-xl z-20 overflow-hidden hidden md:block" style={{ backgroundColor: theme.backgroundColor }}>
                                       <img src={event.coverImage} className="w-full h-full object-cover opacity-50" />
                                    </div>
                                 </div>
                              </div>
                           )}

                           {layout === 'stack' && (
                              <div className="flex flex-col items-center py-16 px-4">
                                 <div className="relative max-w-2xl w-full mb-20">
                                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-0">
                                       <img src={event.coverImage} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-12 -right-4 md:-right-16 z-10 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-lg border border-slate-100">
                                       <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-right" style={{ color: theme.primaryColor }}>{event.name}</h2>
                                       <div className="flex items-center justify-end gap-6 text-sm font-bold uppercase tracking-wider" style={{ color: theme.secondaryColor }}>
                                          <div className="flex items-center gap-2">
                                             <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                                             <Calendar className="w-4 h-4" />
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <span>{event.location}</span>
                                             <MapPin className="w-4 h-4" />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="mt-12 max-w-md w-full">
                                    <LandingPanel />
                                 </div>
                              </div>
                           )}

                        </div>
                     </div>
                  </div>
               );
            })()}

            {/* 3. Results View */}
            {viewState === 'results' && (
               <div ref={resultsRef} className="w-full max-w-6xl mx-auto px-4 mt-8 animate-fade-in-up">
                  <div className="text-center mb-10">
                     <h2 className="text-3xl font-bold mb-2" style={{ color: theme.primaryColor }}>
                        {mode === 'full' ? 'הגלריה של האירוע' : 'הגלריה שלך מהאירוע'}
                     </h2>
                     <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.secondaryColor }}>
                        <span>{event.name}</span>
                        <span>|</span>
                        <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                        <span>|</span>
                        <span>{event.location}</span>
                     </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                     className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 p-4 rounded-2xl shadow-sm border transition-all duration-300"
                     style={{ backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }}
                  >
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="flex bg-slate-100/50 p-1.5 rounded-xl">
                           <div className="px-6 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm" style={{ backgroundColor: theme.accentColor, color: '#FFFFFF' }}>
                              {mode === 'full' ? 'כל התמונות' : 'התמונות שנמצאו'}
                           </div>
                        </div>
                        <div className="h-6 w-px" style={{ backgroundColor: theme.cardBorder }}></div>
                        {mode !== 'full' && (
                           <button onClick={clearSearch} className="text-sm font-bold flex items-center gap-2 transition-all duration-300" style={{ color: theme.textSecondary }}>
                              <div
                                 className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                                 style={{ backgroundColor: `${theme.accentColor}10` }}
                                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.accentColor}20`}
                                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${theme.accentColor}10`}
                              >
                                 <RefreshCw className="w-4 h-4" style={{ color: theme.accentColor }} />
                                 <span>סלפי חדש</span>
                              </div>
                           </button>
                        )}
                     </div>

                     <div className="flex flex-wrap items-center gap-4">
                        <button onClick={selectedPhotos.size === photos.length ? deselectAllPhotos : selectAllPhotos} className="text-sm font-bold transition-all hover:opacity-80" style={{ color: theme.accentColor }}>
                           {selectedPhotos.size === photos.length ? 'נקה בחירה' : 'בחר הכל'}
                        </button>
                        <button
                           onClick={handleShareSelection}
                           disabled={selectedPhotos.size === 0}
                           className="px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all flex items-center gap-2 border"
                           style={selectedPhotos.size > 0
                              ? { backgroundColor: `${theme.accentColor}12`, color: theme.accentColor, borderColor: theme.accentColor, boxShadow: `0 2px 8px ${theme.accentColor}10` }
                              : { backgroundColor: 'transparent', color: `${theme.secondaryColor}60`, borderColor: theme.cardBorder, cursor: 'not-allowed' }
                           }
                        >
                           <Share2 className="w-4 h-4" />
                           {selectedPhotos.size > 0 ? `שתף (${selectedPhotos.size})` : 'שתף'}
                        </button>
                        <button
                           onClick={handleDownloadAll}
                           disabled={selectedPhotos.size === 0}
                           className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all flex items-center gap-2 ${selectedPhotos.size > 0 ? 'text-white hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                           style={selectedPhotos.size > 0 ? { backgroundColor: theme.accentColor } : {}}
                        >
                           <Download className="w-4 h-4" />
                           {selectedPhotos.size > 0 ? `הורד (${selectedPhotos.size})` : 'הורד הכל'}
                        </button>
                     </div>
                  </div>

                  {viewState === 'results' && mode !== 'full' && (
                     <div className="flex justify-start mb-2 px-1">
                        <SortingControl currentSort={sortBy} onSortChange={setSortBy} />
                     </div>
                  )}

                  <div className="flex flex-wrap justify-center pb-8" dir="rtl">
                     {photos.map((photo) => {
                        const isSelected = selectedPhotos.has(photo.id);
                        return (
                           <div
                              key={photo.id}
                              className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#F0EBE3] cursor-pointer w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] m-2 transition-all duration-300"
                              style={isSelected ? { boxShadow: `0 0 0 2px white, 0 0 0 6px ${theme.accentColor}` } : {}}
                              onClick={() => setLightboxPhoto(photo)}
                           >
                              <img src={photo.url} alt="Gallery Item" className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105" loading="lazy" />
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                              <button
                                 type="button"
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePhotoSelection(photo.id); }}
                                 className="absolute top-3 right-3 w-10 h-10 z-20 rounded-full flex items-center justify-center transition-all"
                                 style={isSelected ? { backgroundColor: theme.accentColor, color: 'white' } : { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                              >
                                 <CheckCircle2 className="w-5 h-5 shadow-sm" />
                              </button>
                              <div className="absolute bottom-3 right-3 left-3 flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-y-2 md:group-hover:translate-y-0">
                                 <button onClick={(e) => handleDownload(photo, e)} className="w-9 h-9 rounded-full bg-white/90 text-[#4A3B2C] flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg">
                                    <Download className="w-4 h-4" />
                                 </button>
                                 <button onClick={(e) => handleShare(photo, e)} className="w-9 h-9 rounded-full bg-white/90 text-[#4A3B2C] flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg">
                                    <Share2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {totalPages > 1 && (
                     <div className="flex flex-col items-center gap-4 mt-12 mb-8" dir="rtl">
                        <div className="flex justify-center items-center gap-3">
                           <button onClick={() => handlePageChange(1)} disabled={page === 1} className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="לעמוד הראשון">
                              <ChevronsRight className="w-5 h-5" />
                           </button>
                           <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="w-12 h-12 rounded-full bg-white shadow-md border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0" title="הקודם">
                              <ChevronRight className="w-6 h-6" />
                           </button>
                           <div className="flex items-center gap-3 text-[#8B7355] font-medium text-xl mx-2">
                              <div className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center shadow-md overflow-hidden relative group cursor-text" style={{ backgroundColor: theme.accentColor }}>
                                 <input type="text" inputMode="numeric" pattern="[0-9]*" defaultValue={page} key={page} className="w-full h-full bg-transparent text-center text-white font-bold text-lg focus:outline-none placeholder-white/50" onKeyDown={(e) => { if (e.key === 'Enter') { const val = parseInt(e.currentTarget.value); if (!isNaN(val) && val >= 1 && val <= totalPages) { handlePageChange(val); e.currentTarget.blur(); } else { e.currentTarget.value = page.toString(); } } }} onBlur={(e) => { const val = parseInt(e.currentTarget.value); if (!isNaN(val) && val >= 1 && val <= totalPages) { if (val !== page) handlePageChange(val); } else { e.currentTarget.value = page.toString(); } }} onClick={(e) => e.currentTarget.select()} aria-label="עבור לעמוד" />
                              </div>
                              <div className="flex items-center gap-1 text-base">
                                 <span>מתוך</span>
                                 <span>{totalPages}</span>
                              </div>
                           </div>
                           <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="w-12 h-12 rounded-full bg-white shadow-md border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0" title="הבא">
                              <ChevronLeft className="w-6 h-6" />
                           </button>
                           <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="לעמוד האחרון">
                              <ChevronsLeft className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  )}

                  {photos.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-3xl border border-[#F0EBE3] mt-8">
                        <p className="text-[#8B7355] text-lg">לא נמצאו תמונות. נסה סלפי אחר.</p>
                        <button onClick={clearSearch} className="mt-4 font-bold underline" style={{ color: theme.accentColor }}>נסה שוב</button>
                     </div>
                  )}
               </div>
            )}
         </div>

         <footer className="mt-0">
            <div className="py-10 px-6 relative overflow-hidden transition-all duration-700" style={{ backgroundColor: theme.headerBackground }}>
               <div className="absolute top-0 left-0 right-0 h-px bg-[#D4C4B0]/50"></div>
               <div className="max-w-2xl mx-auto text-center relative z-10">
                  {viewState === 'results' ? (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-3 leading-tight" style={{ color: theme.primaryColor }}>אהבתם את התמונות?<br />חכו שתראו איך נצלם את האירוע שלכם (:</h2>
                        <p className="mb-6 text-base" style={{ color: theme.secondaryColor }}>שמרו את הפרטים שלנו או עברו לאתר שלנו לפרטים נוספים</p>
                     </div>
                  ) : (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-3 leading-tight" style={{ color: theme.primaryColor }}>היום אתם אורחים -<br />מחר אתם בעלי האירוע!</h2>
                        <p className="mb-6 text-base" style={{ color: theme.secondaryColor }}>שמרו את הפרטים שלנו או עברו לאתר שלנו לפרטים נוספים</p>
                     </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center">
                     <button onClick={handleSavePhone} className="group relative overflow-hidden text-white py-4 px-10 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0" style={{ backgroundColor: theme.accentColor }}>
                        <div className="flex items-center justify-center gap-3 relative z-10">
                           <span className="text-lg">שמור מספר טלפון</span>
                           <Phone className="w-5 h-5 fill-current group-hover:rotate-12 transition-transform" />
                        </div>
                     </button>
                     {photographer?.websiteUrl && (
                        <button onClick={() => handleSocialClick(photographer.websiteUrl!, 'website')} className="group relative overflow-hidden bg-white py-4 px-10 rounded-full font-bold shadow-md border transition-all transform hover:-translate-y-0.5 active:translate-y-0" style={{ color: theme.primaryColor, borderColor: theme.cardBorder }}>
                           <div className="flex items-center justify-center gap-3 relative z-10">
                              <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: theme.accentColor }} />
                              <span className="text-lg">מעבר לאתר הצלם</span>
                           </div>
                        </button>
                     )}
                  </div>
               </div>
            </div>
            <div className="py-6 text-center transition-all duration-700" style={{ backgroundColor: theme.headerBackground, borderTop: `1px solid ${theme.cardBorder}` }}>
               <a href="https://click2pic.co.il" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-70 transition-opacity">
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: `${theme.secondaryColor}80` }}>Powered by</p>
                  <span className="font-bold text-lg" style={{ color: theme.accentColor }}>Click2Pic</span>
               </a>
            </div>
         </footer>

         {lightboxPhoto && (
            <LightboxOverlay
               photo={lightboxPhoto}
               onClose={() => setLightboxPhoto(null)}
               onNext={handleNextPhoto}
               onPrev={handlePrevPhoto}
               onDownload={handleDownload}
               onShare={handleShare}
               hasNext={(() => {
                  const navArray = viewState === 'results' ? searchResults : photos;
                  return navArray.findIndex(p => p.id === lightboxPhoto.id) < navArray.length - 1;
               })()}
               hasPrev={(() => {
                  const navArray = viewState === 'results' ? searchResults : photos;
                  return navArray.findIndex(p => p.id === lightboxPhoto.id) > 0;
               })()}
            />
         )}

         <Toast show={showToast} message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      </div>
   );
};

export default GalleryPage;