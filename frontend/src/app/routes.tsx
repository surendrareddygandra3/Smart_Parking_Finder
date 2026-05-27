import { Navigate, Outlet } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'

export const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // placeholders for next slices
  { path: '/app', element: <Outlet />, children: [{ index: true, element: <Navigate to="/" replace /> }] },
]

