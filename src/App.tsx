import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './features/home/HomePage';
import GalleryPage from './features/gallery/GalleryPage';
import DashboardPage from './features/admin/DashboardPage';
import CreateEventPage from './features/admin/CreateEventPage';
import EventManagePage from './features/admin/EventManagePage';
import AuthPage from './features/auth/AuthPage';
import ProfileCompletionPage from './features/auth/ProfileCompletionPage';
import ProfileSuccessPage from './features/auth/ProfileSuccessPage';
import AuthCallbackPage from './features/auth/AuthCallbackPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import ContactPage from './features/home/ContactPage';
import SettingsPage from './features/admin/SettingsPage';
import { CONFIG } from './config';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Log the current mode on app start!@!Q
  console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #f59e0b; font-weight: bold');
  console.log(`%c🚀 Click2Pic Frontend Started`, 'color: #10b981; font-size: 16px; font-weight: bold');
  console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #f59e0b; font-weight: bold');
  console.log(`%c📡 Mode: ${CONFIG.USE_MOCK ? '🔴 MOCK (localStorage)' : '🟢 REAL BACKEND'}`, 'color: #3b82f6; font-size: 14px; font-weight: bold');
  if (!CONFIG.USE_MOCK) {
    console.log(`%c🌐 Backend URL: ${CONFIG.API_BASE_URL}`, 'color: #8b5cf6; font-size: 12px');
  }
  console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #f59e0b; font-weight: bold');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="gallery/:id" element={<GalleryPage mode="guest" />} />

        <Route path="auth" element={<AuthPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="auth/reset-password" element={<ResetPasswordPage />} />

        {/* Profile Completion - Must be OUTSIDE ProtectedRoute */}
        <Route path="complete-profile" element={<ProfileCompletionPage />} />
        <Route path="profile-success" element={<ProfileSuccessPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<DashboardPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
          <Route path="admin/create-event" element={<CreateEventPage />} />
          <Route path="admin/events/:id" element={<EventManagePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;