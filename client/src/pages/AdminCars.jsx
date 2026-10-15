import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Car, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cars/pending');
      setCars(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleAction = async (carId, action) => {
    try {
      await api.patch(`/admin/cars/${carId}/${action}`);
      toast.success(action === 'approve' ? 'Car approved' : 'Car rejected');
      setCars(cars.filter(c => c._id !== carId));
    } catch (e) {
      toast.error('Action failed');
    }
  };

  if (loading) return <CarsSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Pending Car Approvals</h1>
        {cars.length===0 ? <EmptyState title="No pending cars" description="All cars are up to date." /> : (
          <div className="space-y-4">
            {cars.map(c => (
              <div key={c._id} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={c.images?.[0]?.url || '/placeholder-car.svg'} alt={`${c.brand} ${c.model}`} className="w-24 h-16 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.brand} {c.model}</h3>
                    <p className="text-sm text-gray-500">{c.registrationNumber} • {c.seatingCapacity} seats • ${c.pricePerDay}/day</p>
                    <p className="text-sm text-gray-500">{c.location}</p>
                    <p className="text-xs text-gray-400">Owner: {c.ownerId?.name} ({c.ownerId?.email})</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={()=>handleAction(c._id,'approve')}><CheckCircle className="h-4 w-4 mr-1"/> Approve</Button>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={()=>handleAction(c._id,'reject')}>
                    <XCircle className="h-4 w-4 mr-1"/> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function CarsSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-10 w-1/4 mb-8 rounded" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} className="h-28 w-full rounded-xl bg-white border border-gray-100 p-4" />)}
      </div>
    </PageContainer>
  );
}