import React, { useState } from 'react';
import { X, Copy, CheckCircle2, XCircle } from 'lucide-react';
import { unsecuredCopyToClipboard } from '../../../utils/clipboard'; // Assuming this path, will verify
import { Toast } from '../../../components';

interface Event {
    id: string;
    name: string;
    slug?: string;
    coupleSlug?: string;
}

interface EventShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
    photographerName?: string;
}

const EventShareModal: React.FC<EventShareModalProps> = ({ isOpen, onClose, event, photographerName = 'הצלם שלכם' }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    if (!isOpen) return null;

    const couplePath = event.coupleSlug || event.id;
    const guestPath = event.slug || event.id;
    const coupleUrl = `${window.location.origin}/gallery/${couplePath}`;
    const guestUrl = `${window.location.origin}/gallery/${guestPath}`;

    const shareText = `היי,
שמחתי להיות שם ולתעד את הרגעים היפים שלכם!
התמונות מוכנות והנה הקישור לגלריה המלאה עבורכם:
${coupleUrl}

בנוסף מצרף את הקישור לאורחים שם הם יוכלו להעלות סלפי ולקבל רק את התמונות שהם מופיעים בהם בצורה אוטומטית מאובטחת ומהירה, מבלי לחפש בכל האלבום.
${guestUrl}

נתראה בשמחות!
${photographerName}`;

    const handleCopyText = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareText);
                setToastMessage('הטקסט הועתק ללוח');
                setToastType('success');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                unsecuredCopyToClipboard(shareText);
                setToastMessage('הטקסט הועתק ללוח');
                setToastType('success');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
            // Optional: Close modal after copy? keeping it open might be better UX
            // onClose(); 
        } catch (err) {
            setToastMessage('שגיאה בהעתקה');
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleWhatsApp = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const handleEmail = () => {
        const subject = `גלריית ${event.name}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
        window.location.href = mailtoUrl;
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-green-50 text-green-500">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">שתף אירוע</h3>
                    <p className="text-slate-500 text-sm mb-6">{event.name}</p>

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-3 px-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <span>שתף בוואטסאפ</span>
                        </button>

                        <button
                            onClick={handleEmail}
                            className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>שתף במייל</span>
                        </button>

                        <button
                            onClick={handleCopyText}
                            className="w-full py-3 px-4 rounded-xl bg-cyan-50 text-cyan-700 font-bold hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2 border border-cyan-100"
                        >
                            <Copy className="w-5 h-5" />
                            <span>העתק טקסט</span>
                        </button>
                    </div>
                </div>
            </div>

            <Toast
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default EventShareModal;
