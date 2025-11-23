import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './features/home/HomePage';
import GalleryPage from './features/gallery/GalleryPage';
import DashboardPage from './features/admin/DashboardPage';
import CreateEventPage from './features/admin/CreateEventPage';
import EventManagePage from './features/admin/EventManagePage';
import AuthPage from './features/auth/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="gallery/:id" element={<GalleryPage mode="guest" />} />
          <Route path="gallery/:id/full" element={<GalleryPage mode="full" />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="admin" element={<DashboardPage />} />
          <Route path="admin/create-event" element={<CreateEventPage />} />
          <Route path="admin/events/:id" element={<EventManagePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;