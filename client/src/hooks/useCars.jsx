
// src/hooks/useCars.jsx

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { carService } from '../services/carService';

// Explore cars
export function useCars(params = {}) {
  return useQuery({
    queryKey: ['cars', params],
    queryFn: async () => {
      const response = await carService.list(params);
      return response.data;
    },
  });
}

// Single car details
export function useCar(id) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: async () => {
      const response = await carService.get(id);
      // server returns { success: true, data: carObject }
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}

// Car availability
export function useCarAvailability(params) {
  return useQuery({
    queryKey: ['car-availability', params],
    queryFn: async () => {
      const response = await carService.availability(params);
      return response.data;
    },
    enabled: Boolean(
      params?.carId &&
      params?.pickup &&
      params?.return
    ),
  });
}

// Owner's cars
export function useMyCars() {
  return useQuery({
    queryKey: ['myCars'],
    queryFn: async () => {
      const response = await carService.myCars();
      return response.data;
    },
  });
}

// Create car
export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => carService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myCars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });
    },
  });
}

// Update car
export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      carService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['myCars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['car', variables.id],
      });
    },
  });
}

// Delete car
export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => carService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myCars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });
    },
  });
}

// Approve car
export function useApproveCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => carService.approve(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['myCars'],
      });
    },
  });
}

// Reject car
export function useRejectCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => carService.reject(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cars'],
      });

      queryClient.invalidateQueries({
        queryKey: ['myCars'],
      });
    },
  });
}
