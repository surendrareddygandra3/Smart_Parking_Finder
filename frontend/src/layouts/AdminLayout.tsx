import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'

export function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-zinc-950/90 p-6">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-5 w-5 text-cyan-400" />
          Admin Console
        </div>
        <nav className="space-y-2 text-sm text-zinc-300">
          <Link className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white" to="/admin">
            Overview
          </Link>
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>
      <main className="ml-64 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  )
}
