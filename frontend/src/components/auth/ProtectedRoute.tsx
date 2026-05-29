import { Navigate, Outlet, useLocation } from 'react-router-dom'

type Props = {
  roles?: string[]
}

export function ProtectedRoute({ roles }: Props) {
  const location = useLocation()
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length) {
    const raw = localStorage.getItem('auth_user')
    const user = raw ? (JSON.parse(raw) as { role?: string }) : null
    if (!user?.role || !roles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
