import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Camera, Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-accent font-bold' : 'text-secondary hover:text-primary'}`;

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-lightgray">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold text-xl">
            <Camera className="text-accent" /> <span>Click2Pic</span>
          </div>
          <div className="hidden md:flex gap-8">
            <NavLink to="/" className={navClass}>HOME</NavLink>
            <NavLink to="/gallery" className={navClass}>GALLERY</NavLink>
            <NavLink to="/auth" className={navClass}>PHOTOGRAPHERS</NavLink>
            <NavLink to="/admin" className={navClass}>ADMIN</NavLink>
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
        </div>
        {isOpen && (
          <div className="md:hidden bg-white border-b p-4 flex flex-col gap-4">
            <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/gallery" onClick={() => setIsOpen(false)}>Gallery</NavLink>
            <NavLink to="/auth" onClick={() => setIsOpen(false)}>Photographers</NavLink>
            <NavLink to="/admin" onClick={() => setIsOpen(false)}>Admin</NavLink>
          </div>
        )}
      </nav>
      <main className="flex-grow"><Outlet /></main>
      <footer className="bg-primary text-neutral-400 py-6 text-center text-sm">© 2025 Click2Pic</footer>
    </div>
  );
};
export default MainLayout;