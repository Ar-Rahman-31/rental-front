// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useBookingNotifications } from '../../hooks/useBookingNotifications';

export function MainLayout() {
  useBookingNotifications(); // global listener – runs once per session
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}