import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { http } from '../../lib/http'

type Overview = {
  users: number
  parking_lots: number
  bookings_total: number
  bookings_active: number
  bookings_by_status: Record<string, number>
}

export function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await http.get<Overview>('/admin/analytics/overview')
      return res.data
    },
  })

  const chartData = Object.entries(data?.bookings_by_status ?? {}).map(([status, count]) => ({
    status,
    count,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics overview</h1>
        <p className="mt-1 text-sm text-zinc-400">Operations, occupancy, and booking health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Users', value: data?.users ?? 0 },
          { label: 'Parking lots', value: data?.parking_lots ?? 0 },
          { label: 'Total bookings', value: data?.bookings_total ?? 0 },
          { label: 'Active bookings', value: data?.bookings_active ?? 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-zinc-400">{kpi.label}</div>
            <div className="mt-2 text-3xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-medium">Bookings by status</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="status" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Bar dataKey="count" fill="#c084fc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
