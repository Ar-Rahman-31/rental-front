// src/hooks/useBookings.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';

export function useMyBookings(params = {}) {
  return useQuery({ queryKey: ['my-bookings', params], queryFn: () => bookingService.myBookings(params) });
}
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bookingService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }) });
}
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bookingService.cancel, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }) });
}
export function useOwnerBookings(params = {}) {
  return useQuery({ queryKey: ['owner-bookings', params], queryFn: () => bookingService.ownerBookings(params) });
}
export function useAcceptBooking() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bookingService.accept, onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-bookings'] }) });
}
export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bookingService.reject, onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-bookings'] }) });
}
export function useBooking(id) {
  return useQuery({ queryKey: ['booking', id], queryFn: () => bookingService.get(id), enabled: !!id });
}