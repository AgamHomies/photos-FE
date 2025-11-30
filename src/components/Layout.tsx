import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
    children: ReactNode;
    showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
            <Header isAuthenticated={isAuthenticated} />

            <main className="flex-grow relative">
                {/* Background decorative elements - consistent across pages */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-purple-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
                </div>

                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
