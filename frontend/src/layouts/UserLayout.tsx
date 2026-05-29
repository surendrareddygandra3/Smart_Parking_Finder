import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Car, LogOut, MapPin } from 'lucide-react'

export function UserLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/app" className="flex items-center gap-2 font-semibold">
            <Car className="h-5 w-5 text-fuchsia-400" />
            Smart Parking
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link to="/app" className="hover:text-white">
              Dashboard
            </Link>
            <Link to="/app/map" className="inline-flex items-center gap-1 hover:text-white">
              <MapPin className="h-4 w-4" />
              Map
            </Link>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1 hover:text-white">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
