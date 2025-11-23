import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Camera, Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-amber-600 font-bold' : 'text-stone-600 hover:text-stone-900'}`;

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-stone-900">
            <Camera className="text-amber-600" /> <span>Click2Pic</span>
          </Link>

          <div className="hidden md:flex gap-8">
            <NavLink to="/" className={navClass}>HOME</NavLink>
            {/* Gallery link removed as requested */}
            <NavLink to="/auth" className={navClass}>PHOTOGRAPHERS</NavLink>
            <NavLink to="/admin" className={navClass}>ADMIN</NavLink>
          </div>

          <button className="md:hidden text-stone-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-b border-stone-100 p-4 flex flex-col gap-4">
            <NavLink to="/" className={navClass} onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/auth" className={navClass} onClick={() => setIsOpen(false)}>Photographers</NavLink>
            <NavLink to="/admin" className={navClass} onClick={() => setIsOpen(false)}>Admin</NavLink>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 font-serif font-bold text-lg text-white mb-4">
            <Camera className="text-amber-600" /> <span>Click2Pic</span>
          </div>
          <p>© 2025 Click2Pic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;