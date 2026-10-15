
import { api } from './api';

export const carService = {
  list: (params) => api.get('/cars', { params }),

  get: (id) => api.get(`/cars/${id}`),

  availability: (params) =>
    api.get('/cars/availability', { params }),

  create: (formData) => api.post('/cars', formData),

  update: (id, formData) =>
    api.patch(`/cars/${id}`, formData),

  remove: (id) => api.delete(`/cars/${id}`),

  approve: (id) => api.patch(`/cars/${id}/approve`),

  reject: (id) => api.patch(`/cars/${id}/reject`),

  myCars: () => api.get('/cars/my-cars'),
};
