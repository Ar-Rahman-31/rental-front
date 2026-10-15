
// src/pages/DashboardOwner.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useOwnerBookings,
} from '../hooks/useBookings';

import {
  useMyCars,
} from '../hooks/useCars';

import { BookingCard } from '../components/common/BookingCard';
import { CarCard } from '../components/common/CarCard';
import { PageContainer } from '../components/layout/PageContainer';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/ui/Tabs';

import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';

import { Plus } from 'lucide-react';

// Extract an array from common API response formats.
function getArray(response, keys = []) {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.bookings,
    response?.data?.cars,
    response?.bookings,
    response?.cars,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }

    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  return [];
}

export function DashboardOwner() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const {
    data: carsData,
    isLoading: carsLoading,
    isError: carsError,
    refetch: refetchCars,
  } = useMyCars();

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useOwnerBookings({
    status: tab === 'overview' || tab === 'cars' ? undefined : tab,
    page: 1,
    limit: 10,
  });

  // Handle responses whether they contain arrays directly
  // or inside data, bookings, or cars properties.
  const cars = getArray(carsData, ['cars']);
  const bookings = getArray(bookingsData, ['bookings']);

  const pendingCount = bookings.filter(
    (booking) => booking.bookingStatus === 'pending'
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.bookingStatus === 'confirmed'
  ).length;

  const completedEarnings = bookings
    .filter((booking) => booking.bookingStatus === 'completed')
    .reduce(
      (total, booking) => total + (Number(booking.totalAmount) || 0),
      0
    );

  const stats = [
    { label: 'Total cars', value: cars.length },
    { label: 'Pending requests', value: pendingCount },
    { label: 'Active rentals', value: confirmedCount },
    {
      label: 'Earnings (est.)',
      value: `$${completedEarnings.toLocaleString()}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Owner Dashboard
          </h1>

          <Button onClick={() => navigate('/owner/add-car')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Car
          </Button>
        </div>

        {/* Dashboard statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cars">My Cars</TabsTrigger>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="text-lg font-semibold">
                Welcome back!
              </h2>

              <p className="mt-2 text-gray-600">
                Manage your cars and booking requests from the tabs above.
              </p>

              <Button
                className="mt-4"
                onClick={() => navigate('/owner/add-car')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Car
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cars">
            {carsLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-gray-100 bg-white p-4"
                  >
                    <LoadingSkeleton className="mb-3 h-40 w-full rounded-lg" />
                    <LoadingSkeleton className="mb-2 h-4 w-3/4 rounded" />
                    <LoadingSkeleton className="h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : carsError ? (
              <ErrorMessage
                message="Failed to load your cars."
                onRetry={() => refetchCars()}
              />
            ) : cars.length === 0 ? (
              <EmptyState
                title="No cars yet"
                description="Add your first vehicle to start earning."
                action={
                  <Button onClick={() => navigate('/owner/add-car')}>
                    Add Car
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cars.map((car) => (
                  <CarCard
                    key={car._id}
                    car={car}
                    ownerView
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {[
            'pending',
            'confirmed',
            'rejected',
            'cancelled',
            'completed',
          ].map((status) => (
            <TabsContent key={status} value={status}>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((item) => (
                    <LoadingSkeleton
                      key={item}
                      className="h-32 w-full rounded-xl border border-gray-100 bg-white p-4"
                    />
                  ))}
                </div>
              ) : bookingsError ? (
                <ErrorMessage
                  message={`Failed to load ${status} bookings.`}
                  onRetry={() => refetchBookings()}
                />
              ) : bookings.length === 0 ? (
                <EmptyState
                  title={`No ${status} bookings`}
                  description="Booking requests for your cars will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      role="owner"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </PageContainer>
    </div>
  );
}
