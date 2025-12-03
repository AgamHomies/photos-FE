import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-6">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                </div>

                <div className="flex gap-6 text-sm">
                    <button onClick={() => {}} className="hover:text-white transition-colors">תנאי שימוש</button>
                    <button onClick={() => {}} className="hover:text-white transition-colors">מדיניות פרטיות</button>
                    <button onClick={() => window.location.href = '/contact'} className="hover:text-white transition-colors">צור קשר</button>
                </div>

                <div className="text-sm">
                    © 2024 Click2Pic. כל הזכויות שמורות.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
