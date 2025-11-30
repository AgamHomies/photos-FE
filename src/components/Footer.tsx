import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                </div>

                <div className="flex gap-6 text-sm">
                    <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
                    <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
                    <a href="#" className="hover:text-white transition-colors">שאלות נפוצות</a>
                    <a href="#" className="hover:text-white transition-colors">צור קשר</a>
                </div>

                <div className="text-sm">
                    © 2024 Click2Pic. כל הזכויות שמורות.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
