// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <PageContainer className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
          <p className="mt-4 text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/"><Button variant="secondary"><Home className="h-4 w-4 mr-2"/> Back home</Button></Link>
            <Link to="/explore"><Button><Search className="h-4 w-4 mr-2"/> Explore cars</Button></Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}