
import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';

import { Home } from '../pages/Home';
import { ExploreCars } from '../pages/ExploreCars';
import { CarDetail } from '../pages/CarDetail';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { OwnerLogin } from '../pages/OwnerLogin';
import { OwnerRegister } from '../pages/OwnerRegister';
import { VerifyEmail } from '../pages/VerifyEmail';
import { VerifyOtp } from '../pages/VerifyOtp';

import { DashboardCustomer } from '../pages/DashboardCustomer';
import { DashboardOwner } from '../pages/DashboardOwner';
import AddCar  from '../pages/AddCar';
import { EditCar } from '../pages/EditCar';
import { ManageCars } from '../pages/ManageCars';
import { BookingRequests } from '../pages/BookingRequests';
import { MyBookings } from '../pages/MyBookings';
import { Profile } from '../pages/Profile';

import { NotFound } from '../pages/NotFound';

import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminUsers } from '../pages/AdminUsers';
import { AdminCars } from '../pages/AdminCars';
import { AdminBookings } from '../pages/AdminBookings';

import {
  ProtectedRoute,
  OwnerRoute,
  AdminRoute,
} from '../components/auth/RouteGuards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,

    children: [
      // Public routes
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'explore',
        element: <ExploreCars />,
      },
      {
        path: 'cars/:id',
        element: <CarDetail />,
      },

      // Customer authentication
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },

      // Owner authentication
      {
        path: 'owner/login',
        element: <OwnerLogin />,
      },
      {
        path: 'owner/register',
        element: <OwnerRegister />,
      },

      // Become a Car Owner - fixed route
      {
        path: 'become-owner',
        element: <OwnerRegister />,
      },

      {
        path: 'verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'verify-otp',
        element: <VerifyOtp />,
      },

      // Protected routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
            <DashboardCustomer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
            <Profile />
          </ProtectedRoute>
        ),
      },

      // Owner routes
      {
        path: 'owner/dashboard',
        element: (
          <OwnerRoute>
            <DashboardOwner />
          </OwnerRoute>
        ),
      },
      {
        path: 'owner/add-car',
        element: (
          <OwnerRoute>
            <AddCar />
          </OwnerRoute>
        ),
      },
      {
        path: 'owner/cars',
        element: (
          <OwnerRoute>
            <ManageCars />
          </OwnerRoute>
        ),
      },
      {
        path: 'owner/cars/:id/edit',
        element: (
          <OwnerRoute>
            <EditCar />
          </OwnerRoute>
        ),
      },
      {
        path: 'owner/bookings',
        element: (
          <OwnerRoute>
            <BookingRequests />
          </OwnerRoute>
        ),
      },

      // Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/cars',
        element: (
          <AdminRoute>
            <AdminCars />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/bookings',
        element: (
          <AdminRoute>
            <AdminBookings />
          </AdminRoute>
        ),
      },

      // 404 route for unmatched URLs
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);