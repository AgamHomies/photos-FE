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
   Globe,
   Copy,
   Heart,
   ChevronLeft,
   ChevronRight,
   ArrowUpDown
} from 'lucide-react';
import { Toast } from '../../components';

interface GalleryPageProps {
   mode?: 'guest' | 'full';
}

const GalleryPage: React.FC<GalleryPageProps> = ({ mode: propMode }) => {
   const { id } = useParams<{ id: string }>();
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

   const [sortBy, setSortBy] = useState<'time' | 'matchScore'>('time');

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
            return valB - valA;
         });
      }
      return sorted;
   }, [searchResults, sortBy, viewState]);




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
            // We do this first or parallel to ensure subsequent renders don't see it
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('photoId');
            const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
            window.history.replaceState({}, '', newUrl);

            // If photo is already in photos array (e.g. page 1), use it
            const existingPhoto = photos.find(p => p.id == photoId);
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

         // Wait a bit for main data to load, or run immediately if independent
         if (!loading) {
            openDeepLinkedPhoto();
         }
      }
   }, [loading, photos]);

   // Handle Shared Selection Deep Link
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const rawSelectionId = params.get('selectionId');
      // Sanitize: sometimes users copy paste with line numbers like :1
      const selectionId = rawSelectionId ? rawSelectionId.split(':')[0] : null;

      if (selectionId && id) {
         const loadSelection = async () => {
            setLoading(true);
            try {
               // Clear URL param
               const newParams = new URLSearchParams(window.location.search);
               newParams.delete('selectionId');
               const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
               window.history.replaceState({}, '', newUrl);

               const selectedPhotos = await BackendService.getSelection(id, selectionId);
               console.log('GalleryPage: setting selected photos (directly to photos):', selectedPhotos.length);

               // Set photos directly so they are available for lightbox navigation
               setPhotos(selectedPhotos);

               // Open the first photo immediately
               if (selectedPhotos.length > 0) {
                  setLightboxPhoto(selectedPhotos[0]);
               }

               // Set view state to landing so if they close lightbox, they see the selfie upload
               console.log('GalleryPage: setting viewState to landing');
               setViewState('landing');
            } catch (err) {
               console.error("Failed to load selection", err);
               triggerToast('טעינת הבחירה נכשלה', 'error');

            } finally {
               // Only turn off loading if event is already loaded to prevent "Event not found" flash
               // If event is not loaded yet, loadData will handle turning off loading
               if (eventRef.current) {
                  setLoading(false);
               } else {
                  console.log('GalleryPage: selection loaded, but event not ready. Keeping loading=true');
               }
            }
         };
         loadSelection();
      }
   }, [id]);

   const loadData = async (eventId: string) => {
      // Capture detailed state synchronously before any async operations
      // This prevents race conditions where other effects (like selectionId loading)
      // might clear the URL params while we are fetching data.
      const initialParams = new URLSearchParams(window.location.search);
      const hasSelectionId = !!initialParams.get('selectionId');

      try {
         // First fetch the event to get the real numeric ID
         const eventData = await BackendService.getEvent(eventId);

         if (eventData) {
            setEvent(eventData);
            // Determine mode from event data if available
            const currentMode = eventData.mode || propMode || 'guest';
            setMode(currentMode);

            console.log('Event loaded:', { id: eventData.id, photographerId: eventData.photographerId });

            if (eventData.photographerId) {
               console.log('Fetching photographer profile for:', eventData.photographerId);
               try {
                  const profile = await BackendService.getPhotographerProfile(eventData.photographerId);
                  console.log('Photographer profile fetched:', profile);
                  setPhotographer(profile);
               } catch (err) {
                  console.error('Error fetching photographer profile:', err);
               }
            } else {
               console.warn('No photographerId found on event');
            }

            // Now fetch photos using the real numeric ID
            // Note: For full mode, we stick to fetching the specific page
            // For guest (landing), we don't show photos initially

            // If we have a selection ID, we skip all default photo loading/landing logic
            // and let the loadSelection effect handle the view.
            if (!hasSelectionId) {
               if (currentMode === 'full') {
                  const eventPhotos = await BackendService.getEventPhotos(eventData.id, 1, itemsPerPage);
                  setPhotos(eventPhotos);
                  setPage(1);
                  setViewState('results');
               } else {
                  setViewState('landing');
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
         // Server-side pagination
         setLoading(true);
         try {
            const newPhotos = await BackendService.getEventPhotos(event.id, newPage, itemsPerPage);
            setPhotos(newPhotos);
            setPage(newPage);
         } catch (error) {
            console.error("Failed to change page", error);
         } finally {
            setLoading(false);
         }
      } else if (viewState === 'results') {
         // Client-side pagination (update triggered by useEffect)
         setPage(newPage);
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
         setViewState('scanning'); // Show scanning state immediately
         setSelectedImage(originalFile); // Show original while processing

         try {
            const resizedFile = await resizeImage(originalFile);
            console.log(`Resized image: ${originalFile.size} -> ${resizedFile.size} bytes`);
            performFaceSearch(resizedFile);
         } catch (error) {
            console.error('Error resizing image:', error);
            triggerToast('שגיאה בעיבוד התמונה', 'error');
            setViewState('landing');
         }
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

         setSearchResults(matches); // Store all matches
         setSortBy('matchScore'); // Default to matchScore sort on new search
         setPage(1); // Reset to first page
         // Photos will be updated by useEffect based on page 1 and itemsPerPage
         setViewState('results');

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

      // Get short link for smart sharing (with dynamic OG tags)
      // Default fallback (client-side constructed)
      let shareUrl = `${window.location.origin}/share/photo/${photo.id}?url=${encodeURIComponent(photo.url)}&event=${encodeURIComponent(event?.name || 'אירוע')}&title=${encodeURIComponent(photo.title || 'תמונה מהאירוע')}`;

      try {
         // Attempt to fetch smart short link from backend
         const publicPhoto = await BackendService.getPublicPhoto(photo.id);
         if (publicPhoto && publicPhoto.shareLink) {
            shareUrl = publicPhoto.shareLink;
         }
      } catch (err) {
         console.error('Failed to get smart share link, falling back to legacy link', err);
      }

      const unsecuredCopyToClipboard = (text: string) => {
         const textArea = document.createElement("textarea");
         textArea.value = text;
         textArea.style.position = "fixed";
         textArea.style.left = "-9999px";
         textArea.style.top = "0";
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();
         try {
            document.execCommand('copy');
            triggerToast('הקישור לתמונה הועתק ללוח');
         } catch (err) {
            console.error('Fallback: Unable to copy', err);
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

         // Logic to copy/share the link
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
            // Fallback to clipboard
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

         // Optional: Deselect after sharing? User might want to keep selection.
         // deselectAllPhotos(); 

      } catch (error) {
         console.error('Failed to share selection:', error);
         triggerToast('יצירת הקישור נכשלה', 'error');
      }
   };

   // Keyboard navigation for lightbox
   useEffect(() => {
      if (!lightboxPhoto) return;

      const handleKeyDown = (e: KeyboardEvent) => {
         // Use searchResults for guest mode to enable navigation across all images, not just current page
         const navArray = viewState === 'results' ? searchResults : photos;
         const currentIndex = navArray.findIndex(p => p.id === lightboxPhoto.id);

         if (e.key === 'ArrowLeft') { // Next in RTL
            if (currentIndex < navArray.length - 1) {
               setLightboxPhoto(navArray[currentIndex + 1]);
            }
         } else if (e.key === 'ArrowRight') { // Prev in RTL
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
      // Use searchResults for guest mode to enable navigation across all images
      const navArray = viewState === 'results' ? searchResults : photos;
      const currentIndex = navArray.findIndex(p => p.id === lightboxPhoto.id);
      if (currentIndex < navArray.length - 1) {
         setLightboxPhoto(navArray[currentIndex + 1]);
      }
   };

   const handlePrevPhoto = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!lightboxPhoto) return;
      // Use searchResults for guest mode to enable navigation across all images
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

         if (!response.ok) {
            throw new Error('Download failed');
         }

         const data = await response.json();
         const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

         if (isMobile) {
            // For mobile compatibility:
            // Navigating directly to the signed URL with Content-Disposition: attachment
            // is the most reliable way to trigger a download without opening a new tab.
            window.location.href = data.url;
         } else {
            try {
               // For desktop: Fetch blob to force download
               const imageResponse = await fetch(data.url);
               if (!imageResponse.ok) throw new Error('Image fetch failed');

               const blob = await imageResponse.blob();
               const url = window.URL.createObjectURL(blob);
               const link = document.createElement('a');
               link.href = url;
               // Try to get filename from content-disposition if possible, or fallback to sensible default
               link.download = `photo-${photo.id}.jpg`;
               document.body.appendChild(link);
               link.click();
               document.body.removeChild(link);
               window.URL.revokeObjectURL(url);
            } catch (err) {
               console.warn('Blob download failed, falling back to direct navigation', err);
               window.location.href = data.url;
            }
         }

      } catch (error) {
         console.error('Download error:', error);
         // Fallback to opening in new tab if anything fails
         window.open(photo.url, '_blank');
      }
   };

   const handleDownloadAll = async () => {
      if (photos.length === 0) return;

      const photosToDownload = selectedPhotos.size > 0
         ? photos.filter(p => selectedPhotos.has(p.id))
         : photos;

      if (mode === 'full' && selectedPhotos.size === 0) {
         window.location.href = `${CONFIG.API_BASE_URL}/public/events/${id}/download-all`;
      } else {
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
               triggerToast('שגיאה ביצירת קובץ ההורדה', 'error');
            }
         } catch (e) {
            console.error(e);
            triggerToast('שגיאה בהורדה', 'error');
         }
      }
   };

   const handleSavePhone = async () => {
      if (!photographer?.phone) return;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
         // Create vCard for mobile
         const vCardData = `BEGIN:VCARD
                  VERSION:3.0
                  FN:${photographer.name}
                  TEL;TYPE=CELL:${photographer.phone}
                  END:VCARD`;

         const blob = new Blob([vCardData], { type: 'text/vcard' });
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `${photographer.name}.vcf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
      } else {
         // Copy to clipboard for desktop
         try {
            await navigator.clipboard.writeText(photographer.phone);
            triggerToast(`המספר ${photographer.phone} הועתק ללוח`);
         } catch (error) {
            console.error('Failed to copy phone:', error);
         }
      }

      if (id) {
         await BackendService.trackContactSaved(id);
      }
   };

   const handleSocialClick = async (url: string, source: string) => {
      if (!url) return;

      if (id) {
         await BackendService.trackTrafficSource(id, source);
      }
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

   const isScanning = viewState === 'scanning';

   return (
      <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#5C4A3A] flex flex-col" dir="rtl">

         {/* 1. Header & Branding - Full Width Darker Beige Background */}
         <div className="w-full bg-[#EEE9E1] pt-8 pb-8 text-center shadow-sm relative z-10">
            <div className="mb-4">
               {photographer?.profileImageUrl ? (
                  <img
                     src={photographer.profileImageUrl}
                     alt="Logo"
                     className="w-20 h-20 mx-auto rounded-lg object-contain bg-transparent"
                     onError={(e) => {
                        // Fallback if image fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                     }}
                  />
               ) : null}
               {!photographer?.profileImageUrl && (
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#F5F1EB] flex items-center justify-center border border-[#E8DFD3]">
                     <Camera className="w-8 h-8 text-[#C4A882]" />
                  </div>
               )}
            </div>

            <h1 className="text-3xl font-bold text-[#4A3B2C] mb-1">
               {photographer?.name || 'שם הצלם'}
            </h1>
            <p className="text-xs tracking-[0.2em] text-[#A89680] uppercase mb-4">
               PHOTOGRAPHY STUDIO
            </p>

            <div className="flex items-center justify-center gap-4">
               {photographer?.tiktokUrl && (
                  <button
                     onClick={() => handleSocialClick(photographer.tiktokUrl!, 'tiktok')}
                     className="text-[#8B7355] hover:text-black transition-colors"
                     title="TikTok"
                  >
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                     </svg>
                  </button>
               )}
               {photographer?.facebookUrl && (
                  <button
                     onClick={() => handleSocialClick(photographer.facebookUrl!, 'facebook')}
                     className="text-[#8B7355] hover:text-blue-600 transition-colors"
                     title="Facebook"
                  >
                     <Facebook className="w-5 h-5" />
                  </button>
               )}
               {photographer?.instagramUrl && (
                  <button
                     onClick={() => handleSocialClick(photographer.instagramUrl!, 'instagram')}
                     className="text-[#8B7355] hover:text-pink-600 transition-colors"
                     title="Instagram"
                  >
                     <Instagram className="w-5 h-5" />
                  </button>
               )}
            </div>
         </div>

         {/* Spacer / Background for Main Content - Lighter Cream */}
         <div className="bg-[#FDFBF7] flex-grow w-full flex flex-col items-center py-12">

            {/* 2. Main Content Card */}
            {viewState !== 'results' && (
               <div className="w-full max-w-5xl mx-auto px-4">
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E8DFD3]">
                     {/* Card Header (Event Details) */}
                     <div className="text-center py-8 px-6 border-b border-[#E8DFD3]">
                        <h2 className="text-3xl font-bold text-[#4A3B2C] mb-4">
                           {mode === 'full' ? 'הגלריה של האירוע' : 'הגלריה שלך מהאירוע'}
                        </h2>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-[#8B7355] text-lg font-medium max-w-2xl mx-auto">
                           <div className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4 text-[#C4A882]" />
                              <span>{event.name}</span>
                           </div>
                           <span className="hidden md:inline w-px h-4 bg-[#E8DFD3]"></span>
                           <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#C4A882]" />
                              <span>{new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                           </div>
                           <span className="hidden md:inline w-px h-4 bg-[#E8DFD3]"></span>
                           <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#C4A882]" />
                              <span>{event.location}</span>
                           </div>
                        </div>
                     </div>

                     {/* Split Layout */}
                     <div className="flex flex-col md:flex-row h-auto md:h-[500px]">

                        {/* Left Side (Desktop) / Bottom (Mobile) - Content & Action */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-[#FAF9F6] order-2 md:order-1">

                           {isScanning ? (
                              <div className="flex flex-col items-center animate-pulse">
                                 <div className="relative w-32 h-32 mb-6">
                                    {selectedImage && (
                                       <img
                                          src={URL.createObjectURL(selectedImage)}
                                          alt="Selfie"
                                          className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                       />
                                    )}
                                    <div className="absolute inset-0 rounded-full border-4 border-[#C4A882] border-t-transparent animate-spin"></div>
                                 </div>
                                 <h3 className="text-2xl font-bold text-[#4A3B2C] mb-2">מחפש אותך...</h3>
                                 <p className="text-[#8B7355]">סורק את התמונות באמצעות AI</p>
                              </div>
                           ) : (
                              <>
                                 <div className="w-16 h-16 bg-[#F0EBE3] rounded-full flex items-center justify-center mb-6">
                                    <Camera className="w-8 h-8 text-[#C4A882]" />
                                 </div>

                                 <h3 className="text-2xl font-bold text-[#4A3B2C] mb-3">מצאו את התמונות שלכם מהאירוע</h3>

                                 <p className="text-[#8B7355] mb-8 max-w-sm leading-relaxed text-sm">
                                    העלו סלפי ברור של עצמכם — והמערכת שלנו תזהה אוטומטית ותציג לכם רק את התמונות המדהימות שבהן הופעתם באירוע.
                                 </p>

                                 <label className="bg-[#C4A882] hover:bg-[#B39872] text-white px-8 py-4 rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 transform hover:-translate-y-1 w-full max-w-xs justify-center group">
                                    <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>העלה סלפי למציאת התמונות</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                 </label>

                                 <div className="mt-4 flex items-center gap-2 text-[10px] text-[#A89680]">
                                    <span className="w-3 h-3 text-[#C4A882]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                                    <span>התמונה נמחקת אוטומטית מיד לאחר תהליך הזיהוי.</span>
                                 </div>
                              </>
                           )}
                        </div>

                        {/* Right Side (Desktop) / Top (Mobile) - Cover Image */}
                        <div className="w-full md:w-1/2 h-64 md:h-full relative order-1 md:order-2">
                           <img
                              src={event.coverImage}
                              alt="Cover"
                              className="w-full h-full object-cover shadow-inner"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
                        </div>

                     </div>
                  </div>
               </div>
            )}

            {/* 3. Results View */}
            {viewState === 'results' && (
               <div ref={resultsRef} className="w-full max-w-6xl mx-auto px-4 mt-8 animate-fade-in-up">

                  {/* Minimal Header for Results */}
                  <div className="text-center mb-10">
                     <h2 className="text-3xl font-bold text-[#4A3B2C] mb-2">
                        {mode === 'full' ? 'הגלריה של האירוע' : 'הגלריה שלך מהאירוע'}
                     </h2>
                     <div className="flex items-center justify-center gap-2 text-[#8B7355] text-sm">
                        <span>{event.name}</span>
                        <span>|</span>
                        <span>{new Date(event.date).toLocaleDateString('he-IL')}</span>
                        <span>|</span>
                        <span>{event.location}</span>
                     </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#F0EBE3]">
                     <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#4A3B2C] flex items-center gap-2">
                           {mode === 'full' ? 'כל התמונות' : 'התמונות שנמצאו'}
                           <span className="bg-[#F0EBE3] px-2 py-0.5 rounded-full text-xs text-[#8B7355]">
                              {totalItems}
                           </span>
                        </h3>
                        {mode !== 'full' && (
                           <button
                              onClick={() => setSortBy(prev => prev === 'time' ? 'matchScore' : 'time')}
                              className="text-sm font-medium text-[#8B7355] hover:text-[#C4A882] flex items-center gap-1 mr-4 border-r border-[#F0EBE3] pr-4"
                           >
                              <ArrowUpDown className="w-4 h-4" />
                              {sortBy === 'time' ? 'מיין לפי רמת התאמה' : 'מיין לפי זמנים'}
                           </button>
                        )}
                     </div>

                     <div className="flex items-center gap-3">

                        <button
                           onClick={selectedPhotos.size === photos.length ? deselectAllPhotos : selectAllPhotos}
                           className="text-sm font-medium text-[#8B7355] hover:text-[#C4A882]"
                        >
                           {selectedPhotos.size === photos.length ? 'נקה בחירה' : 'בחר הכל'}
                        </button>

                        <button
                           onClick={handleShareSelection}
                           disabled={selectedPhotos.size === 0}
                           className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${selectedPhotos.size > 0 ? 'bg-white text-[#C4A882] border border-[#C4A882] hover:bg-[#FDFBF7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                           <Share2 className="w-4 h-4" />
                           {selectedPhotos.size > 0 ? `שתף (${selectedPhotos.size})` : 'שתף'}
                        </button>
                        <button
                           onClick={handleDownloadAll}
                           className="bg-[#C4A882] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#B39872] transition-all flex items-center gap-2"
                        >
                           <Download className="w-4 h-4" />
                           {selectedPhotos.size > 0 ? `הורד (${selectedPhotos.size})` : 'הורד הכל'}
                        </button>
                     </div>
                  </div>

                  {/* Grid */}
                  <div className="flex flex-wrap justify-center pb-8" dir="rtl">
                     {photos.map((photo) => {
                        const isSelected = selectedPhotos.has(photo.id);
                        return (
                           <div
                              key={photo.id}
                              className={`group relative aspect-[2/3] rounded-xl overflow-hidden bg-[#F0EBE3] cursor-pointer w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] m-2 ${isSelected ? 'ring-4 ring-[#C4A882] ring-offset-2' : ''}`}
                              onClick={() => setLightboxPhoto(photo)}
                           >
                              <img
                                 src={photo.url}
                                 alt="Gallery Item"
                                 className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                                 loading="lazy"
                              />

                              {/* Overlay Gradient */}
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                              {/* Top Right - Select */}
                              <button
                                 type="button"
                                 onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePhotoSelection(photo.id);
                                 }}
                                 className={`absolute top-3 right-3 w-10 h-10 z-20 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-[#C4A882] text-white shadow-md' : 'bg-white/20 md:hover:bg-white active:bg-white text-white md:hover:text-[#C4A882] active:text-[#C4A882] backdrop-blur-sm'
                                    }`}
                              >
                                 <CheckCircle2 className="w-5 h-5" />
                              </button>

                              {/* Bottom Actions - Always visible on mobile, hover on desktop */}
                              <div className="absolute bottom-3 right-3 left-3 flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-y-2 md:group-hover:translate-y-0">
                                 <button
                                    onClick={(e) => handleDownload(photo, e)}
                                    className="w-9 h-9 rounded-full bg-white/90 text-[#4A3B2C] flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                                    title="הורד תמונה"
                                 >
                                    <Download className="w-4 h-4" />
                                 </button>
                                 <button
                                    onClick={(e) => handleShare(photo, e)}
                                    className="w-9 h-9 rounded-full bg-white/90 text-[#4A3B2C] flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                                    title="שתף תמונה"
                                 >
                                    <Share2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                     <div className="flex justify-center items-center gap-6 mt-12 mb-8" dir="rtl">
                        {/* Previous Button (Right in RTL) */}
                        <button
                           onClick={() => handlePageChange(page - 1)}
                           disabled={page === 1}
                           className="w-12 h-12 rounded-full bg-white shadow-md border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                           title="הקודם"
                        >
                           <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 text-[#8B7355] font-medium text-xl">
                           <span>עמוד</span>

                           <div className="w-12 h-12 rounded-full bg-[#C4A882] text-white font-bold flex items-center justify-center shadow-md">
                              {page}
                           </div>

                           <div className="flex items-center gap-1">
                              <span>מתוך</span>
                              <span>{totalPages}</span>
                           </div>
                        </div>

                        {/* Next Button (Left in RTL) */}
                        <button
                           onClick={() => handlePageChange(page + 1)}
                           disabled={page === totalPages}
                           className="w-12 h-12 rounded-full bg-white shadow-md border border-[#F0EBE3] flex items-center justify-center text-[#8B7355] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                           title="הבא"
                        >
                           <ChevronLeft className="w-6 h-6" />
                        </button>
                     </div>
                  )}

                  {photos.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-3xl border border-[#F0EBE3] mt-8">
                        <p className="text-[#8B7355] text-lg">לא נמצאו תמונות. נסה סלפי אחר.</p>
                        <button
                           onClick={() => setViewState('landing')}
                           className="mt-4 text-[#C4A882] font-bold underline"
                        >
                           נסה שוב
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* End of Main Content Wrapper */}
         </div>

         {/* 4. Footer & Contact */}
         <footer className="mt-0"> {/* Removed margin-top since wrapper handles spacing */}
            {/* Top Section - Darker */}
            <div className="bg-[#EEE9E1] py-10 px-6 relative overflow-hidden">
               {/* Decorative top border */}
               <div className="absolute top-0 left-0 right-0 h-px bg-[#D4C4B0]/50"></div>

               <div className="max-w-2xl mx-auto text-center relative z-10">

                  {viewState === 'results' ? (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-[#4A3B2C] mb-3 leading-tight">
                           אהבתם את התמונות?
                           <br />
                           חכו שתראו איך נצלם את האירוע שלכם (:
                        </h2>
                        <p className="text-[#8B7355] mb-6 text-base">
                           שמרו את הפרטים שלנו או עברו לאתר שלנו לפרטים נוספים
                        </p>
                     </div>
                  ) : (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-[#4A3B2C] mb-3 leading-tight">
                           היום אתם אורחים -<br />מחר אתם בעלי האירוע!
                        </h2>
                        <p className="text-[#8B7355] mb-6 text-base">
                           שמרו את הפרטים שלנו או עברו לאתר שלנו לפרטים נוספים
                        </p>
                     </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center">

                     {/* Save Phone */}
                     <button
                        onClick={handleSavePhone}
                        className="group relative overflow-hidden bg-[#C4A882] text-white py-4 px-8 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-[#B39872] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                     >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                           <span>שמור מספר טלפון</span>
                           <Phone className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
                        </div>
                     </button>

                     {/* Website Link */}
                     {photographer?.websiteUrl && (
                        <button
                           onClick={() => handleSocialClick(photographer.websiteUrl!, 'website')}
                           className="group relative overflow-hidden bg-white text-[#4A3B2C] py-4 px-8 rounded-full font-bold shadow-md border border-[#E8DFD3] hover:border-[#C4A882] hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                           <div className="flex items-center justify-center gap-3 relative z-10">
                              <Globe className="w-4 h-4 text-[#C4A882] group-hover:scale-110 transition-transform" />
                              <span>מעבר לאתר הצלם</span>
                           </div>
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Bottom Section - Lighter */}
            <div className="bg-[#EEE9E1] py-4 text-center border-t border-[#D4C4B0]/20">
               <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#A89680]">Powered by</p>
                  <span className="font-bold text-[#C4A882] text-sm">Click2Pic</span>
               </div>
            </div>
         </footer>

         {/* Lightbox */}
         {lightboxPhoto && (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in text-white/90">
               <button
                  onClick={() => setLightboxPhoto(null)}
                  className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
               >
                  <X className="w-8 h-8" />
               </button>

               <img
                  src={lightboxPhoto.url}
                  alt="Full view"
                  className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
               />

               {/* Navigation Buttons */}
               <button
                  onClick={handleNextPhoto}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10 ${(() => {
                     const navArray = viewState === 'results' ? searchResults : photos;
                     return navArray.findIndex(p => p.id === lightboxPhoto.id) >= navArray.length - 1 ? 'opacity-30 cursor-not-allowed' : '';
                  })()}`}
                  disabled={(() => {
                     const navArray = viewState === 'results' ? searchResults : photos;
                     return navArray.findIndex(p => p.id === lightboxPhoto.id) >= navArray.length - 1;
                  })()}
                  title="הבא"
               >
                  <ChevronLeft className="w-8 h-8" />
               </button>

               <button
                  onClick={handlePrevPhoto}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10 ${(() => {
                     const navArray = viewState === 'results' ? searchResults : photos;
                     return navArray.findIndex(p => p.id === lightboxPhoto.id) <= 0 ? 'opacity-30 cursor-not-allowed' : '';
                  })()}`}
                  disabled={(() => {
                     const navArray = viewState === 'results' ? searchResults : photos;
                     return navArray.findIndex(p => p.id === lightboxPhoto.id) <= 0;
                  })()}
                  title="הקודם"
               >
                  <ChevronRight className="w-8 h-8" />
               </button>

               <div className="absolute bottom-8 flex gap-6">
                  <button onClick={(e) => handleDownload(lightboxPhoto, e)} className="text-white flex flex-col items-center gap-1 hover:text-[#C4A882] transition-colors">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Download className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-medium">הורד</span>
                  </button>
                  <button onClick={(e) => handleShare(lightboxPhoto, e)} className="text-white flex flex-col items-center gap-1 hover:text-[#C4A882] transition-colors">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Share2 className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-medium">שתף</span>
                  </button>
               </div>
            </div>
         )}

         {/* Toast Notification */}
         <Toast
            show={showToast}
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
         />

      </div>
   );
};


export default GalleryPage;