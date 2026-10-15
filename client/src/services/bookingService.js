// src/services/bookingService.js
import { api } from './api';

export const bookingService = {
  create:       (data) => api.post('/bookings', data),
  myBookings:   (params) => api.get('/bookings/my-bookings', { params }),
  ownerBookings:(params) => api.get('/bookings/owner', { params }),
  get:          (id) => api.get(`/bookings/${id}`),
  accept:       (id) => api.patch(`/bookings/${id}/accept`),
  reject:       (id) => api.patch(`/bookings/${id}/reject`),
  cancel:       (id) => api.patch(`/bookings/${id}/cancel`),
};