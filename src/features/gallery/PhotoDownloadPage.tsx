import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BackendService } from '../../services/backendService';
import { Photo } from '../../types';
import { Loader2, ArrowRight, Download, Heart, Smartphone, Monitor, Share2, Check, Camera, Instagram, Globe, Phone, HeartHandshake, Facebook, ChevronRight } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { Toast } from '../../components';

const PhotoDownloadPage: React.FC = () => {
    const { id: eventId } = useParams<{ id: string }>(); // Use 'id' to match route /gallery/:id
    const [searchParams] = useSearchParams();
    const photoId = searchParams.get('photoId');



    const [photo, setPhoto] = useState<Photo | null>(null);
    const [photographer, setPhotographer] = useState<any | null>(null); // Ideally use PhotographerProfile type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    // Device detection
    const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setDeviceType('ios');
        } else if (/android/i.test(userAgent)) {
            setDeviceType('android');
        } else {
            setDeviceType('desktop');
        }
    }, []);

    useEffect(() => {
        if (!photoId || !eventId) {
            setError('Photo ID or Event ID missing');
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                // 1. Fetch Photo
                const photoData = await BackendService.getPublicPhoto(photoId);
                if (photoData) {
                    setPhoto(photoData);
                } else {
                    throw new Error('Photo not found');
                }

                // 2. Fetch Event to get Photographer ID
                const eventData = await BackendService.getEvent(eventId);
                if (eventData && eventData.photographerId) {
                    // 3. Fetch Photographer Profile
                    try {
                        const profile = await BackendService.getPhotographerProfile(eventData.photographerId);
                        setPhotographer(profile);
                    } catch (err) {
                        console.error('Failed to load photographer profile', err);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('לא ניתן לטעון את הנתונים');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [photoId, eventId]);



    // Ensure scroll is enabled (in case it was locked by a previous component or state)
    useEffect(() => {
        document.body.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const toggleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleSaveContact = () => {
        if (!photographer) return;

        // On desktop, copy phone number to clipboard
        if (deviceType === 'desktop') {
            const phoneNumber = photographer.phone || '';
            if (!phoneNumber) return;

            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(phoneNumber)
                    .then(() => {
                        alert('מספר הטלפון הועתק ללוח');
                    })
                    .catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = phoneNumber;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-9999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            alert('מספר הטלפון הועתק ללוח');
                        } catch (err) {
                            console.error('Failed to copy', err);
                        }
                        document.body.removeChild(textArea);
                    });
            } else {
                // Fallback for browsers without clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = phoneNumber;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('מספר הטלפון הועתק ללוח');
                } catch (err) {
                    console.error('Failed to copy', err);
                }
                document.body.removeChild(textArea);
            }
            return;
        }

        // On mobile, download vCard as before
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${photographer.name || 'הצלם שלך'}
TEL;TYPE=CELL:${photographer.phone || ''}
URL:${photographer.websiteUrl || ''}
EMAIL:${photographer.contactEmail || ''}
END:VCARD`;

        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${photographer.name || 'photographer'}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (error || !photo) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
                <p className="text-xl mb-4 text-red-400">{error || 'התמונה לא נמצאה'}</p>
                {/* Back button removed as per request for new tab/window without back ability */}
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen h-auto bg-[#FDFBF7] text-[#5C4A3A] pb-32 flex flex-col pt-safe-top overflow-y-auto">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-[#EEE9E1]/90 backdrop-blur-md sticky top-0 z-20 border-b border-[#E8DFD3] shadow-sm">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 rounded-full hover:bg-[#E8DFD3] transition-colors text-[#5C4A3A]"
                    aria-label="חזור"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg text-[#5C4A3A]">שמירת תמונה</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            <div className="flex-1 flex flex-col items-center p-4 space-y-6 max-w-md mx-auto w-full">

                {/* 1. PHOTO - Centered Card (Reverted Layout) */}
                <div className="w-full bg-slate-200 rounded-3xl overflow-hidden shadow-xl relative group">
                    <img
                        src={photo.url}
                        alt="Preview"
                        className="w-full h-auto max-h-[60vh] object-contain bg-slate-100"
                    />
                </div>

                {/* 2. Instructions & Actions */}
                <div className="w-full space-y-6">

                    {/* Instructions */}
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-[#5C4A3A] tracking-tight">
                            {deviceType === 'ios' && 'איך שומרים?'}
                            {deviceType === 'android' && 'איך מורידים?'}
                            {deviceType === 'desktop' && 'שמירה למחשב'}
                        </h2>
                        <div className="text-[#8B7355] text-base font-medium leading-relaxed">
                            {deviceType === 'ios' && (
                                <>
                                    <span dir="rtl">לחיצה ארוכה על התמונה ואז</span>
                                    <br />
                                    <span dir="rtl" className="inline-block px-3 py-1 bg-white rounded-lg text-[#5C4A3A] text-xs font-bold mt-1 border border-[#E8DFD3] shadow-sm">שמור בתמונות</span>
                                </>
                            )}
                            {deviceType === 'android' && (
                                <>
                                    <span dir="rtl">לחיצה ארוכה על התמונה ואז</span>
                                    <br />
                                    <span className="inline-block px-3 py-1 bg-white rounded-lg text-[#5C4A3A] text-xs font-bold mt-1 border border-[#E8DFD3] shadow-sm">הורד תמונה</span>
                                </>
                            )}
                            {deviceType === 'desktop' && (
                                <>
                                    <span dir="rtl">מקש ימני על התמונה ואז</span>
                                    <br />
                                    <span dir="rtl" className="inline-block px-3 py-1 bg-white rounded-lg text-[#5C4A3A] text-xs font-bold mt-1 border border-[#E8DFD3] shadow-sm">שמור תמונה בשם...</span>
                                </>
                            )}
                        </div>
                    </div>


                    {/* Credit Section */}
                    <div className="flex flex-col items-center gap-3 w-full">
                        <button dir="rtl"
                            onClick={toggleLike}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-90 duration-300 ${isLiked
                                ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-pink-500/30 scale-110'
                                : 'bg-white text-[#C4A882] hover:text-[#B39872] border-2 border-[#F0EBE3] hover:border-[#C4A882]'
                                }`}
                        >
                            <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} strokeWidth={isLiked ? 0 : 2.5} />
                        </button>

                        <div className={`text-center transition-all duration-500 max-w-xs ${isLiked ? 'opacity-100 transform translate-y-0' : 'opacity-60'}`}>
                            <p dir="rtl" className={`text-sm font-bold leading-relaxed ${isLiked ? 'text-[#5C4A3A]' : 'text-[#8B7355]'}`}>
                                {isLiked
                                    ? 'איזה כיף שפירגנת! מוזמן לשמור את הפרטים שלנו למטה ונשמח לתת שירות גם באירוע שלך!'
                                    : 'אהבת? פרגן לצלם בלב 😉'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Photographer Contact Card - Monochrome Design */}
                    {photographer && (
                        <div className="w-full bg-[#F0EBE3] rounded-2xl p-5 border border-[#E8DFD3] shadow-lg hover:shadow-xl transition-all duration-200">
                            {/* Outer Flex Container - Wraps on small screens */}
                            <div className="flex flex-wrap items-center gap-4">

                                {/* Right Side: Avatar + Title + Social Icons */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        {photographer.profileImageUrl ? (
                                            <img
                                                src={photographer.profileImageUrl}
                                                alt={photographer.name || 'הצלם שלך'}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white bg-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                                <Camera className="w-7 h-7" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Title + Social Icons */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#5C4A3A] truncate text-xl leading-tight mb-3">
                                            {photographer.name || 'הצלם שלך'}
                                        </h4>

                                        {/* Social Icons Row - Single Line, Tight Spacing */}
                                        <div className="flex items-center flex-nowrap gap-1 overflow-x-auto scrollbar-hide">
                                            {photographer.instagramUrl && (
                                                <a
                                                    href={photographer.instagramUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="אינסטגרם"
                                                    className="w-7 h-7 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center text-[#8B7355] hover:text-[#5C4A3A] active:text-[#4A3B2C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#F0EBE3]"
                                                >
                                                    <Instagram className="w-4 h-4" strokeWidth={2.5} />
                                                </a>
                                            )}
                                            {photographer.facebookUrl && (
                                                <a
                                                    href={photographer.facebookUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="פייסבוק"
                                                    className="w-7 h-7 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center text-[#8B7355] hover:text-[#5C4A3A] active:text-[#4A3B2C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#F0EBE3]"
                                                >
                                                    <Facebook className="w-4 h-4" strokeWidth={2.5} />
                                                </a>
                                            )}
                                            {photographer.tiktokUrl && (
                                                <a
                                                    href={photographer.tiktokUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="טיקטוק"
                                                    className="w-7 h-7 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center text-[#8B7355] hover:text-[#5C4A3A] active:text-[#4A3B2C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#F0EBE3]"
                                                >
                                                    <FaTiktok className="w-4 h-4" />
                                                </a>
                                            )}
                                            {photographer.websiteUrl && (
                                                <a
                                                    href={photographer.websiteUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="אתר אינטרנט"
                                                    className="w-7 h-7 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center text-[#8B7355] hover:text-[#5C4A3A] active:text-[#4A3B2C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#F0EBE3]"
                                                >
                                                    <Globe className="w-4 h-4" strokeWidth={2.5} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Left Side: CTA Button */}
                                <button
                                    onClick={handleSaveContact}
                                    aria-label="שמור פרטי איש קשר"
                                    title="שמור את פרטי הצלם לאנשי הקשר שלך"
                                    className="shrink-0 px-5 py-3 bg-[#C4A882] text-white text-sm font-bold rounded-xl hover:bg-[#B39872] active:scale-95 transition-all duration-200 shadow-lg shadow-[#C4A882]/20 hover:shadow-xl hover:shadow-[#C4A882]/30 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#F0EBE3]"
                                >
                                    <span>שמור</span>
                                    <Phone className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PhotoDownloadPage;
