import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { http } from '../../lib/http'

type ParkingLot = {
  lot_id: number
  lot_name: string
  location: string
  total_slots: number
  available_slots: number
  booked_slots: number
}

type Booking = {
  booking_id: string
  lot_id: number
  slot_id: string
  vehicle_type: string
  status: string
}

export function UserDashboard() {
  const qc = useQueryClient()

  const parkings = useQuery({
    queryKey: ['parkings'],
    queryFn: async () => {
      const res = await http.get<{ parkings: ParkingLot[] }>('/parking/list')
      return res.data.parkings
    },
  })

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await http.get<Booking[]>('/booking/list')
      return res.data
    },
  })

  const createBooking = useMutation({
    mutationFn: async (payload: { lot_id: string; vehicle_type: string }) => {
      const res = await http.post('/booking/reserve', null, { 
        params: { lot_id: payload.lot_id, vehicle_type: payload.vehicle_type } 
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Booking created')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['parkings'] })
    },
    onError: () => toast.error('Booking failed'),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Find lots, reserve slots, track active bookings.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {(parkings.data ?? []).map((lot) => (
          <div key={lot.lot_id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="font-medium">{lot.lot_name}</div>
            <div className="mt-1 text-xs text-zinc-400">{lot.location}</div>
            <div className="mt-4 text-sm">
              <span className="text-emerald-400">{lot.available_slots}</span> available / {lot.total_slots} total
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
              disabled={lot.available_slots === 0 || createBooking.isPending}
              onClick={() =>
                createBooking.mutate({
                  lot_id: String(lot.lot_id),
                  vehicle_type: 'car',
                })
              }
            >
              Quick book slot {lot.lot_id}-1
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Your bookings</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(bookings.data ?? []).map((b) => (
                <tr key={b.booking_id} className="border-t border-white/10">
                  <td className="px-4 py-3">{b.booking_id}</td>
                  <td className="px-4 py-3">{b.lot_id}</td>
                  <td className="px-4 py-3">{b.slot_id}</td>
                  <td className="px-4 py-3 capitalize">{b.status}</td>
                </tr>
              ))}
              {!bookings.data?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
