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
  created_at: string
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
      toast.success('Booking created successfully!')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['parkings'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Booking failed')
    },
  })

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await http.delete(`/booking/release/${bookingId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully!')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['parkings'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking')
    },
  })

  const activeBookings = bookings.data?.filter(b => b.status === 'active') ?? []
  const completedBookings = bookings.data?.filter(b => b.status !== 'active') ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Find lots, reserve slots, and manage your bookings</p>
      </div>

      {/* Available Parking Lots */}
      <section>
        <h2 className="mb-4 text-lg font-medium">Available Parking Lots</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {parkings.isLoading ? (
            <div className="col-span-3 py-8 text-center text-zinc-500">Loading parking lots...</div>
          ) : parkings.data?.length ? (
            parkings.data.map((lot) => (
              <div key={lot.lot_id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="font-medium">{lot.lot_name}</div>
                <div className="mt-1 text-xs text-zinc-400">{lot.location}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-emerald-400 font-semibold">{lot.available_slots}</span>
                    <span className="text-zinc-400"> available / {lot.total_slots} total</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {lot.booked_slots} booked
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={lot.available_slots === 0 || createBooking.isPending}
                  onClick={() =>
                    createBooking.mutate({
                      lot_id: String(lot.lot_id),
                      vehicle_type: 'car',
                    })
                  }
                >
                  {createBooking.isPending ? 'Booking...' : 'Book Parking'}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-zinc-500">No parking lots available</div>
          )}
        </div>
      </section>

      {/* Active Bookings */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Active Bookings ({activeBookings.length})</h2>
        <div className="overflow-hidden rounded-lg border border-white/10">
          {activeBookings.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((b) => (
                  <tr key={b.booking_id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs">{b.booking_id}</td>
                    <td className="px-4 py-3">{b.lot_id}</td>
                    <td className="px-4 py-3 font-mono">{b.slot_id}</td>
                    <td className="px-4 py-3 capitalize">{b.vehicle_type}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => cancelBooking.mutate(b.booking_id)}
                        disabled={cancelBooking.isPending}
                        className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {cancelBooking.isPending ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">No active bookings</div>
          )}
        </div>
      </section>

      {/* Booking History */}
      {completedBookings.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">Booking History ({completedBookings.length})</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((b) => (
                  <tr key={b.booking_id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs">{b.booking_id}</td>
                    <td className="px-4 py-3">{b.lot_id}</td>
                    <td className="px-4 py-3 font-mono">{b.slot_id}</td>
                    <td className="px-4 py-3 capitalize">{b.vehicle_type}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
