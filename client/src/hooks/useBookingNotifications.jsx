
// src/hooks/useBookingNotifications.jsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSocket } from '../services/socket';

export const useBookingNotifications = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const handlers = {
      'booking:created': (p) => {
        toast.info(`New booking request ${p.bookingReference}`);
        qc.invalidateQueries({ queryKey: ['owner-bookings'] });
      },

      'booking:accepted': (p) => {
        toast.success(`Your booking ${p.bookingReference} was accepted`);
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
      },

      'booking:rejected': (p) => {
        toast.error(`Your booking ${p.bookingReference} was rejected`);
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
      },

      'booking:cancelled': (p) => {
        toast.info(`Booking ${p.bookingReference} cancelled`);
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
        qc.invalidateQueries({ queryKey: ['owner-bookings'] });
      },

      'booking:expired': (p) => {
        toast.warning(`Booking ${p.bookingReference} expired`);
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
        qc.invalidateQueries({ queryKey: ['owner-bookings'] });
      },
    };

    const socket = getSocket();

    Object.entries(handlers).forEach(([event, handler]) => {
      socket?.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket?.off(event, handler);
      });
    };
  }, [qc]);
};