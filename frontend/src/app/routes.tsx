import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AdminLayout } from '../layouts/AdminLayout'
import { UserLayout } from '../layouts/UserLayout'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { UserDashboard } from '../pages/app/UserDashboard'
import { MapPage } from '../pages/app/MapPage'
import { AdminDashboard } from '../pages/admin/AdminDashboard'

export const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <UserLayout />,
        children: [
          { index: true, element: <UserDashboard /> },
          { path: 'map', element: <MapPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [{ index: true, element: <AdminDashboard /> }],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]
