// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Car, Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white" aria-label="DriveEase home">
            <Car className="h-7 w-7 text-primary-500" /> DriveEase
          </Link>
          <p className="mt-4 text-sm leading-relaxed">Premium carrental marketplace. Book instantly, drive confidently.</p>
        </div>
        <nav>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {['Home','Explore Cars','My Bookings','Become a Car Owner'].map(t => (
              <li key={t}><Link to={t.toLowerCase().replace(' ', '-')} className="hover:text-primary-400">{t}</Link></li>
            ))}
          </ul>
        </nav>
        <nav>
          <h3 className="font-semibold text-white">Support</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {['Help Center','Cancellation Policy','Privacy Policy','Terms of Service'].map(t => (
              <li key={t}><Link href="#" className="hover:text-primary-400">{t}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="font-semibold text-white">Connect</h3>
          <div className="mt-4 flex gap-4">
            {[
              { Icon: Twitter, href: 'https://x.com/?lang=en-in' },
              { Icon: Facebook, href: 'https://www.facebook.com/' },
              { Icon: Instagram, href: 'https://www.instagram.com/' },
            ].map(({ Icon, href }) => (
              <a key={href} href={href} className="text-gray-400 hover:text-primary-400" aria-label={Icon.displayName || 'social'}><Icon className="h-5 w-5" /></a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 px-4 py-6 text-center text-sm">
        © {new Date().getFullYear()} DriveEase. All rights reserved.
      </div>
    </footer>
  );
}