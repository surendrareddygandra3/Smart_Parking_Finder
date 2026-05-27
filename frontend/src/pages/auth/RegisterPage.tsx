import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { http } from '../../lib/http'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  phone_number: z.string().min(10),
  password: z.string().min(8),
  dob: z.string().min(4),
  doj: z.string().min(4),
  address: z.string().min(3),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone_number: '',
      password: '',
      dob: '',
      doj: '',
      address: '',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      // Keep compatibility with your existing `/user/register` schema.
      const phone_number = Number(values.phone_number)
      await http.post('/user/register', {
        ...values,
        phone_number,
      })
      toast.success('Account created')
      navigate('/login')
    } catch (e) {
      toast.error('Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-300">Premium experience, real-time availability, secure bookings.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-300">First name</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('first_name')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Last name</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('last_name')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Username</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('username')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Email</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('email')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Phone</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('phone_number')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">Password</label>
              <input type="password" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('password')} />
            </div>
            <div>
              <label className="text-xs text-zinc-300">DOB</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('dob')} placeholder="YYYY-MM-DD" />
            </div>
            <div>
              <label className="text-xs text-zinc-300">DOJ</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('doj')} placeholder="YYYY-MM-DD" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-300">Address</label>
              <input className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2.5 text-sm outline-none" {...form.register('address')} />
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100">
            Create account
          </button>

          <div className="mt-5 text-center text-xs text-zinc-300">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

