import React, { useState, useEffect } from 'react';
import {
    Camera,
    Users,
    Heart,
    Download,
    Share2,
    Phone,
    Globe,
    Instagram,
    Facebook,
    Play,
    Pause,
    ScanFace,
    Check
} from 'lucide-react';

export const PhoneMockupDemo = () => {
    const [demoState, setDemoState] = useState<'scan' | 'click' | 'process' | 'gallery'>('scan');
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const runLoop = () => {
            if (!isPlaying) return;

            if (demoState === 'scan') {
                timeoutId = setTimeout(() => setDemoState('click'), 1500);
            } else if (demoState === 'click') {
                timeoutId = setTimeout(() => setDemoState('process'), 800);
            } else if (demoState === 'process') {
                timeoutId = setTimeout(() => setDemoState('gallery'), 2500);
            } else if (demoState === 'gallery') {
                timeoutId = setTimeout(() => setDemoState('scan'), 4000);
            }
        };

        runLoop();

        return () => clearTimeout(timeoutId);
    }, [demoState, isPlaying]);

    return (
        <div className="absolute inset-0 bg-[#F3EFE9] flex flex-col overflow-hidden font-sans group" dir="rtl">

            {/* Play/Pause Control - Centered on Hover */}
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 z-[70] flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] cursor-pointer"
                title={isPlaying ? "Pause Demo" : "Play Demo"}
            >
                <div className="w-16 h-16 bg-[#F3EFE9]/90 rounded-full flex items-center justify-center shadow-xl border border-[#B09873]/30 transform transition-transform hover:scale-110">
                    {isPlaying ? <Pause className="w-6 h-6 text-[#5C4A3A]" /> : <Play className="w-6 h-6 text-[#5C4A3A] fill-current ml-1" />}
                </div>
            </button>

            {/* === HEADER === */}
            <div className="flex flex-col items-center pt-6 pb-4 shrink-0 z-20 relative transition-all duration-300 bg-[#F3EFE9]">
                {/* Logo - White Square Card with Black Circle */}
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                    <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-serif text-lg font-bold pt-1 tracking-widest">GP</div>
                </div>
                <h1 className="text-xl font-bold tracking-wide leading-none text-[#4A3B2C] mb-1">גיל הפקות</h1>
                <p className="text-[9px] text-[#A89680] tracking-[0.2em] uppercase font-medium">PHOTOGRAPHY STUDIO</p>
                <div className="mt-2 text-[#8B7355] flex items-center gap-2.5">
                    <Instagram className="w-3.5 h-3.5" />
                    <Facebook className="w-3.5 h-3.5" />
                    {/* TikTok Proxy */}
                    <div className="w-3.5 h-3.5 bg-[#8B7355] rounded-full flex items-center justify-center text-white">
                        <span className="text-[10px] font-bold leading-none mt-[2px]">t</span>
                    </div>
                </div>
            </div>

            {/* === CENTER === */}
            <div className="flex-1 relative w-full overflow-hidden bg-[#F3EFE9]">
                {/* State 1: Landing (Event Card) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pb-52 px-4 transition-all duration-500 ${(demoState === 'scan') ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] w-full p-4 text-center border border-white shadow-sm transform scale-95">
                        <h2 className="text-lg font-bold mb-1 text-[#4A3B2C]">הגלריה שלך מהאירוע</h2>
                        <div className="flex items-center justify-center gap-1.5 text-[#B09873] mb-3">
                            <span className="text-sm font-medium">החתונה של רון ולירון</span>
                            <Heart className="w-3 h-3 fill-current" />
                        </div>
                        <div className="aspect-[4/3] w-full max-h-[160px] rounded-xl overflow-hidden relative shadow-sm mx-auto">
                            <img src="/demo/demo_cover_couple.png" alt="Couple" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* State 2: Upload */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pb-52 px-6 transition-all duration-500 ${(demoState === 'click') ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <div className="w-18 h-18 bg-[#E8DFD3] rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <Camera className="w-8 h-8 text-[#8B7355]" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-[#4A3B2C]">מצאו את התמונות שלכם</h2>
                    <p className="text-xs text-[#8B7355] leading-tight mb-6 max-w-[200px] text-center">
                        העלו סלפי והמערכת תזהה אתכם אוטומטית
                    </p>
                    <div className="w-full bg-[#B09873] text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 max-w-[220px]">
                        <span className="text-sm">העלה סלפי לזיהוי</span>
                        <Camera className="w-4 h-4" />
                    </div>
                </div>

                {/* State 3: Processing (Searching) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pb-52 px-6 transition-all duration-500 ${(demoState === 'process') ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <div className="relative mb-3">
                        <div className="w-28 h-28 rounded-full border-[5px] border-white shadow-lg overflow-hidden relative z-10">
                            <img src="/demo/demo_selfie_casual.png" alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                        {/* Spinner Ring */}
                        <div className="absolute -inset-1.5 rounded-full border-[3px] border-[#B09873] border-t-transparent animate-spin z-0"></div>
                    </div>

                    <h2 className="text-2xl font-bold text-[#4A3B2C] mb-1">מחפש אותך...</h2>
                    <p className="text-xs text-[#8B7355] font-medium">סורק את התמונות באמצעות AI</p>
                </div>

                {/* State 4: Gallery (Results) */}
                <div className={`absolute inset-0 flex flex-col bg-white overflow-hidden transition-opacity duration-500 ${(demoState === 'gallery') ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                    <div className="px-5 py-3 text-center">
                        <h2 className="text-[22px] font-extrabold text-[#4A3B2C] mb-1">הגלריה שלך מהאירוע</h2>
                        <p className="text-[11px] text-[#A99270] font-bold tracking-wide">החתונה של רון ולירון | 1.1.26 | אגדתא</p>
                    </div>

                    {/* Actions Card */}
                    <div className="mx-5 mb-3 border border-slate-100 rounded-3xl p-4 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-[#A99270] text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                                <ScanFace className="w-3.5 h-3.5" />
                                <span>מיקוד AI</span>
                            </div>
                            <div className="flex items-center text-[11px] font-bold text-[#5C4A3A]">
                                <span>התמונות שנמצאו</span>
                                <span className="bg-[#F5F1EB] text-[#A99270] px-2 py-0.5 rounded-md mr-2 text-[10px]">1339</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-[#A99270] text-white text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-[#978060] transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                הורד הכל
                            </button>
                            <button className="flex-1 bg-[#F9F9F9] text-[#4A3B2C] text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-100 hover:bg-[#F0F0F0] transition-colors">
                                <Share2 className="w-3.5 h-3.5 text-[#4A3B2C]" />
                                שתף
                            </button>
                        </div>
                    </div>

                    {/* Photo Grid */}
                    <div className="flex-1 px-5 overflow-y-auto pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden relative group shadow-sm bg-gray-50">
                                    <img src={`/demo/demo_photo_${i}.png`} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                    <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-white/40 backdrop-blur-md rounded-full border border-white flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* === FOOTER === */}
            <div className={`bg-[#EBE5DC] pt-4 pb-4 px-5 rounded-t-[1.5rem] text-center shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-30 transition-transform duration-500 transform absolute bottom-0 w-full ${(demoState === 'gallery') ? 'translate-y-full' : 'translate-y-0'}`}>
                <h3 className="text-base font-bold text-[#4A3B2C] leading-5 mb-1.5">
                    היום אתם אורחים -<br />מחר אתם בעלי האירוע!
                </h3>
                <p className="text-[9px] text-[#8B7355] mb-3 max-w-[200px] mx-auto leading-relaxed">
                    שמרו את הפרטים שלנו או עברו לאתר שלנו<br />לפרטים נוספים
                </p>

                <div className="flex flex-col gap-2 mb-3">
                    <button className="w-full bg-[#A99270] hover:bg-[#978060] text-white py-2 rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors">
                        <Phone className="w-3 h-3 fill-current" />
                        שמור מספר טלפון
                    </button>
                    <button className="w-full bg-white border border-[#E8DFD3] text-[#4A3B2C] hover:bg-[#F9F7F5] py-2 rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors">
                        <Globe className="w-3 h-3" />
                        מעבר לאתר הצלם
                    </button>
                </div>

                <div className="border-t border-[#D6C4A8]/20 pt-2">
                    <p className="text-[7px] text-[#A89680] uppercase tracking-[0.2em] font-bold">POWERED BY CLICK2PIC</p>
                </div>
            </div>

        </div>
    );
};
