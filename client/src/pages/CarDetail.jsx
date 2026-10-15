// src/pages/CarDetail.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCar, useCarAvailability } from '../hooks/useCars';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/layout/PageContainer';
import { Calendar, MapPin, Users, ArrowLeft, CreditCard } from 'lucide-react';
import { formatPrice, formatDateTime } from '../utils/format';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { toast } from 'sonner';

export function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: car, isLoading, isError } = useCar(id);
  const [dates, setDates] = useState({ pickup: '', return: '' });
  const [breakdown, setBreakdown] = useState(null);

  const { data: avail, isLoading: availLoading } = useCarAvailability({
    carId: id,
    pickup: dates.pickup,
    return: dates.return
  });

  useEffect(() => {
    if (dates.pickup && dates.return && car) {
      const start = new Date(dates.pickup), end = new Date(dates.return);
      const days = Math.max(1, Math.ceil((end - start) / (1000*60*60*24)));
      const subtotal = days * car.pricePerDay;
      setBreakdown({ days, subtotal, total: subtotal });
    } else setBreakdown(null);
  }, [dates, car]);

  const createBooking = useCreateBooking();
  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
    if (!breakdown) return toast.error('Select valid dates');
    if (avail===false) return toast.error('Car not available for those dates');
    try {
      await createBooking.mutateAsync({ carId: car._id, pickupDateTime: dates.pickup, returnDateTime: dates.return });
      toast.success('Booking request sent!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  if (isLoading) return <CarDetailSkeleton />;
  if (isError || !car) return <ErrorMessage message="Car not found" onRetry={()=>window.location.reload()}/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/explore" className="hover:text-primary-600">Explore</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{car.brand} {car.model}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              {car.images?.[0]?.url ? (
                <img src={car.images[0].url} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {car.images?.slice(1).map((img,i)=>(
                <img key={i} src={img.url} alt={`${car.brand} ${car.model} ${i+2}`} className="aspect-square w-full rounded-lg object-cover hidden sm:block" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.brand} {car.model}</h1>
              <p className="mt-1 text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4"/> {car.location}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="info"><Users className="h-3 w-3 mr-1"/> {car.seatingCapacity} seats</Badge>
              <Badge variant={car.approvalStatus==='approved'?'success':'warning'}>{car.approvalStatus}</Badge>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold">Rental details</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup</label>
                    <input type="datetime-local" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500" value={dates.pickup} onChange={e=>setDates(d=>({...d,pickup:e.target.value}))} min={new Date().toISOString().slice(0,16)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                    <input type="datetime-local" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500" value={dates.return} onChange={e=>setDates(d=>({...d,return:e.target.value}))} min={dates.pickup} />
                  </div>
                </div>

                {breakdown && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between"><span>{breakdown.days} day(s) × {formatPrice(car.pricePerDay)}/day</span><span>{formatPrice(breakdown.subtotal)}</span></div>
                    <hr/>
                    <div className="flex justify-between font-semibold"><span>Estimated total</span><span>{formatPrice(breakdown.total)}</span></div>
                  </div>
                )}

                {availLoading && <p className="text-sm text-gray-500">Checking availability…</p>}
                {avail===false && <p className="text-sm text-red-600">Not available for the selected period</p>}

                <Button type="submit" className="w-full" size="lg" disabled={createBooking.isPending || avail===false}>
                  {createBooking.isPending?'Requesting…':'Request Booking'}
                </Button>
              </form>
            </div>

            <div className="prose max-w-none text-gray-700">{car.description||'No description provided.'}</div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function CarDetailSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-10 w-1/3 mb-8 rounded"/>
      <div className="grid gap-8 lg:grid-cols-2">
        <LoadingSkeleton className="aspect-video w-full rounded-xl"/>
        <div className="space-y-6"><LoadingSkeleton className="h-8 w-1/2 rounded"/><LoadingSkeleton className="h-40 w-full rounded-lg"/></div>
      </div>
    </PageContainer>
  );
}