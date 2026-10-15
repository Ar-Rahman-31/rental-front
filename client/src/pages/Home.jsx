// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Car, MapPin, Clock, Shield, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';

export function Home() {
  const features = [
    { icon: Shield, title: 'Verified Owners', desc: 'Every car owner passes identity & vehicle checks.' },
    { icon: Users, title: '24/7 Support', desc: 'Real‑time chat & phone support for any issue.' },
    { icon: MapPin, title: 'Flexible Pickup', desc: 'Choose location & time that suit you.' },
    { icon: Clock, title: 'Instant Confirmation', desc: 'Book and get confirmation in seconds.' }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden">
        <PageContainer className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Drive with <span className="text-primary-600">Ease</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600">
              The premium marketplace to rent cars from trusted owners – book, unlock, drive.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/explore"><Button size="lg" className="w-full sm:w-auto">Explore Cars</Button></Link>
              <Link to="/owner/register"><Button size="lg" variant="outline" className="w-full sm:w-auto">List Your Car</Button></Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="-mt-10 px-4 sm:px-6 lg:px-8">
        <PageContainer>
          <form className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8" onSubmit={e => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup location</label>
                <input type="text" placeholder="City, airport, address…" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup date & time</label>
                <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return date & time</label>
                <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" size="lg">Search</Button>
              </div>
            </div>
          </form>
        </PageContainer>
      </section>

      <section className="py-16 bg-white">
        <PageContainer>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why DriveEase?</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} className="text-center p-6">
                <f.icon className="h-10 w-10 text-primary-600 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 bg-primary-600">
        <PageContainer className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to earn with your car?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">List your vehicle in minutes, set your price, and start earning from day one.</p>
          <Link to="/owner/register"><Button variant="secondary" size="lg">Become a Car Owner</Button></Link>
        </PageContainer>
      </section>
    </div>
  );
}