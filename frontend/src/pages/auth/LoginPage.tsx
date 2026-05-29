import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { http } from '../../lib/http'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '' } })
  const navigate = useNavigate()

  async function onSubmit(values: FormValues) {
    try {
      const res = await http.post('/auth/login', values)
      const { access_token, refresh_token } = res.data as { access_token: string; refresh_token: string }
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      const me = await http.get<{ email: string; role: string }>('/auth/me')
      localStorage.setItem('auth_user', JSON.stringify(me.data))

      toast.success('Signed in')
      navigate(me.data.role === 'admin' ? '/admin' : '/app')
    } catch (e) {
      toast.error('Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Sign in to manage bookings, vehicles, favorites, and live parking availability.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-300">Email or username</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                {...form.register('identifier')}
                placeholder="you@gmail.com"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/40"
                {...form.register('password')}
                placeholder="••••••••"
              />
            </div>
            <button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100">
              Sign in
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-zinc-300">
            <Link to="/register" className="hover:text-white">
              Create account
            </Link>
            <button type="button" className="hover:text-white">
              Forgot password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

