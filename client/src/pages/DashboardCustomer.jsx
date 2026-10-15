
import { useState } from 'react';
import { useMyBookings } from '../hooks/useBookings';
import { BookingCard } from '../components/common/BookingCard';
import { PageContainer } from '../components/layout/PageContainer';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export function DashboardCustomer() {
  const [tab, setTab] = useState('upcoming');

  const statusMap = {
    upcoming: 'confirmed',
    pending: 'pending',
    past: 'completed',
    cancelled: 'cancelled',
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useMyBookings({
    status: statusMap[tab],
    page: 1,
    limit: 10,
  });

  // Safely extract bookings from common API response formats.
  const responseData = data?.data ?? data;

  const bookings = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.bookings)
      ? responseData.bookings
      : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">
          My Bookings
        </h1>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton
                key={i}
                className="h-32 w-full rounded-xl bg-white border border-gray-100 p-4"
              />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage
            message="Failed to load bookings"
            onRetry={() => refetch()}
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            title={`No ${tab} bookings`}
            description="Your bookings will appear here."
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                role="customer"
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
