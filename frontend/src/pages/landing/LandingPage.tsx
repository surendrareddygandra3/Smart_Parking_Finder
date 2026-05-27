import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 via-transparent to-cyan-500/10" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
          <div className="font-semibold tracking-tight">Smart Parking</div>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 md:grid-cols-2 md:items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
              Real-time availability • Maps • Analytics • Payments
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Find, reserve, and manage parking —{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                in real time
              </span>
              .
            </h1>
            <p className="mt-4 max-w-xl text-zinc-300">
              A startup-grade smart parking platform with live slot updates, route-aware recommendations, and a premium
              admin console for operations, revenue, and occupancy analytics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white backdrop-blur hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-sm font-medium">Live occupancy</div>
                <div className="mt-1 text-xs text-zinc-300">WebSockets powered indicators, auto refresh</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-sm font-medium">Map-first discovery</div>
                <div className="mt-1 text-xs text-zinc-300">Nearest suggestions, distance & routes</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-sm font-medium">Payments & invoices</div>
                <div className="mt-1 text-xs text-zinc-300">Razorpay verification, history, refunds</div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

