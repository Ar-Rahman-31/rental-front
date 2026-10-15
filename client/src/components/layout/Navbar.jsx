// src/components/layout/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore Cars' },
    { to: '/bookings', label: 'My Bookings' },
    { to: '/become-owner', label: 'Become a Car Owner' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700" aria-label="DriveEase home">
            <Car className="h-7 w-7" /> DriveEase
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition ${location.pathname === to ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'owner' ? '/owner/dashboard' : '/dashboard'} className="text-sm font-medium text-gray-700 hover:text-primary-600">Dashboard</Link>
                <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Login</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700 hover:text-primary-600">{label}</Link>
              ))}
              {user ? (
                <>
                  <Link to={user.role === 'owner' ? '/owner/dashboard' : '/dashboard'} onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700 hover:text-primary-600">Dashboard</Link>
                  <Button variant="ghost" className="w-full" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700 hover:text-primary-600">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}