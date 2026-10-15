// src/pages/BookingRequests.jsx
import { useState } from 'react';
import { useOwnerBookings, useAcceptBooking, useRejectBooking } from '../hooks/useBookings';
import { BookingCard } from '../components/common/BookingCard';
import { PageContainer } from '../components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export function BookingRequests() {
  const [tab, setTab] = useState('pending');
  const { data, isLoading } = useOwnerBookings({ status: tab, page: 1, limit: 10 });
  const bookings = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Booking Requests</h1>
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_,i)=><LoadingSkeleton key={i} className="h-32 w-full rounded-xl bg-white border border-gray-100 p-4"/>)}
          </div>
        ) : bookings.length===0 ? (
          <EmptyState title={`No ${tab} requests`} description="Booking requests for your cars will appear here."/>
        ) : (
          <div className="space-y-4">
            {bookings.map(b=> <BookingCard key={b._id} booking={b} role="owner" />)}
          </div>
        )}
      </PageContainer>
    </div>
  );
}