// src/components/common/BookingCard.jsx
import { Badge } from '../ui/Badge';
import { formatDateTime, formatPrice } from '../../utils/format';
import { Calendar, MapPin, CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCancelBooking, useAcceptBooking, useRejectBooking } from '../../hooks/useBookings';
import { toast } from 'sonner';

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  rejected: 'danger',
  cancelled: 'default',
  completed: 'info'
};

export function BookingCard({ booking, role }) {
  const cancel = useCancelBooking();
  const accept = useAcceptBooking();
  const reject = useRejectBooking();

  const car = booking.carId;
  const customer = booking.customerId;

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    try { await cancel.mutateAsync(booking._id); toast.success('Booking cancelled'); }
    catch { toast.error('Cancellation failed'); }
  };
  const handleAccept = async () => {
    try { await accept.mutateAsync(booking._id); toast.success('Booking confirmed'); }
    catch { toast.error('Accept failed'); }
  };
  const handleReject = async () => {
    try { await reject.mutateAsync(booking._id); toast.success('Booking rejected'); }
    catch { toast.error('Reject failed'); }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          <img src={car.images?.[0]?.url || '/placeholder-car.svg'} alt={`${car.brand} ${car.model}`} className="w-24 h-16 rounded-lg object-cover" />
          <div>
            <h3 className="font-semibold text-gray-900">{car.brand} {car.model}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {car.location}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {formatDateTime(booking.pickupDateTime)} → {formatDateTime(booking.returnDateTime)}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:flex-row">
          <Badge variant={statusVariant[booking.bookingStatus]} className="capitalize">{booking.bookingStatus}</Badge>
          <span className="font-bold text-primary-600">{formatPrice(booking.totalAmount)}</span>

          {role === 'customer' && booking.bookingStatus === 'pending' && (
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancel.isPending}>
              <XCircle className="h-4 w-4 mr-1"/> Cancel
            </Button>
          )}
          {role === 'owner' && booking.bookingStatus === 'pending' && (
            <>
              <Button size="sm" onClick={handleAccept} disabled={accept.isPending}><CheckCircle className="h-4 w-4 mr-1"/> Accept</Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleReject} disabled={reject.isPending}><XCircle className="h-4 w-4 mr-1"/> Reject</Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-600">
        <span>Ref: <code className="font-mono">{booking.bookingReference}</code></span>
        {role === 'owner' && customer && <span>Customer: {customer.name} ({customer.email})</span>}
      </div>
    </article>
  );
}