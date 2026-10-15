import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Calendar, CreditCard, User, Car as CarIcon } from 'lucide-react';
import { formatDateTime, formatPrice } from '../utils/format';

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', { params: { status: statusFilter, page, limit: 20 } });
      setBookings(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [statusFilter, page]);

  const statusVariant = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    cancelled: 'default',
    completed: 'info'
  };

  if (loading) return <BookingsSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {bookings.length===0 ? <EmptyState title="No bookings found" description="Try changing filter." /> : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Ref</th>
                  <th className="px-4 py-3 text-left">Car</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Dates</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{b.bookingReference}</td>
                    <td className="px-4 py-3">{b.carId?.brand} {b.carId?.model}</td>
                    <td className="px-4 py-3">{b.customerId?.name} ({b.customerId?.email})</td>
                    <td className="px-4 py-3">{b.ownerId?.name} ({b.ownerId?.email})</td>
                    <td className="px-4 py-3">{formatDateTime(b.pickupDateTime)} → {formatDateTime(b.returnDateTime)}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(b.totalAmount)}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[b.bookingStatus]||'default'} className="capitalize">{b.bookingStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-10 w-1/4 mb-8 rounded" />
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} className="h-12 w-full mb-3 rounded" />)}
      </div>
    </PageContainer>
  );
}