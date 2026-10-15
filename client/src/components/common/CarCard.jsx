// src/components/common/CarCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export function CarCard({ car, ownerView = false }) {
  const img = car.images?.[0]?.url || '/placeholder-car.svg';
  return (
    <Link to={ownerView ? `/owner/cars/${car._id}/edit` : `/cars/${car._id}`} className="block">
      <article className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="aspect-video w-full overflow-hidden">
          <img src={img} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900">{car.brand} {car.model}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {car.location}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {car.seatingCapacity} seats</span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-gray-100">
            <span className="font-bold text-primary-600">{formatPrice(car.pricePerDay)}<span className="text-sm font-normal text-gray-500">/day</span></span>
            {ownerView && car.approvalStatus !== 'approved' && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full capitalize">{car.approvalStatus}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}