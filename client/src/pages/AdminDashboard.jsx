import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Users, Car, Calendar, TrendingUp, Lock, Unlock } from 'lucide-react';
import { formatDate } from '../utils/format';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  const cards = [
    { label: 'Customers', value: stats.users, icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Owners', value: stats.owners, icon: Users, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Listed Cars', value: stats.listedCars, icon: Car, color: 'bg-green-100 text-green-700' },
    { label: 'Pending Cars', value: stats.pendingCars, icon: Car, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'bg-purple-100 text-purple-700' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Calendar, color: 'bg-orange-100 text-orange-700' },
    { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: Calendar, color: 'bg-teal-100 text-teal-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <c.icon className={`h-8 w-8 ${c.color} p-2 rounded-lg`} />
                <span className="text-2xl font-bold text-gray-900">{c.value}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Button onClick={() => navigate('/admin/users')} variant="outline"><Users className="h-4 w-4 mr-2"/> Manage Users</Button>
          <Button onClick={() => navigate('/admin/cars')} variant="outline"><Car className="h-4 w-4 mr-2"/> Approve Cars</Button>
          <Button onClick={() => navigate('/admin/bookings')} variant="outline"><Calendar className="h-4 w-4 mr-2"/> View Bookings</Button>
        </div>
      </PageContainer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-10 w-1/4 mb-8 rounded" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(7)].map((_, i) => <LoadingSkeleton key={i} className="h-28 w-full rounded-xl bg-white border border-gray-100 p-6" />)}
      </div>
    </PageContainer>
  );
}