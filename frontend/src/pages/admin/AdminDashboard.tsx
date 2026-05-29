import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { http } from '../../lib/http'

type Overview = {
  users: number
  parking_lots: number
  bookings_total: number
  bookings_active: number
  bookings_by_status: Record<string, number>
}

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
  user_email: string
  lot_id: number
  slot_id: string
  vehicle_type: string
  status: string
  created_at: string
}

type User = {
  email: string
  name: string
  phone: string
  role: string
  created_at: string
}

export function AdminDashboard() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'lots' | 'bookings' | 'users'>('overview')
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [lotData, setLotData] = useState({ lot_name: '', location: '', hourly_rate: 50, total_slots_count: 10 })

  // Analytics
  const analytics = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await http.get<Overview>('/admin/analytics/overview')
      return res.data
    },
  })

  // Parking Lots
  const parkingLots = useQuery({
    queryKey: ['admin-parking-lots'],
    queryFn: async () => {
      const res = await http.get<ParkingLot[]>('/admin/parking-lots')
      return res.data
    },
  })

  // All Bookings
  const allBookings = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await http.get<Booking[]>('/admin/bookings')
      return res.data
    },
  })

  // All Users
  const allUsers = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await http.get<User[]>('/admin/users')
      return res.data
    },
  })

  // Create Parking Lot
  const createLot = useMutation({
    mutationFn: async () => {
      const res = await http.post('/admin/parking-lots', lotData)
      return res.data
    },
    onSuccess: () => {
      toast.success('Parking lot created!')
      setShowCreateLot(false)
      setLotData({ lot_name: '', location: '', hourly_rate: 50, total_slots_count: 10 })
      qc.invalidateQueries({ queryKey: ['admin-parking-lots'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create lot')
    },
  })

  // Delete Parking Lot
  const deleteLot = useMutation({
    mutationFn: async (lotId: number) => {
      const res = await http.delete(`/admin/parking-lots/${lotId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Parking lot deleted!')
      qc.invalidateQueries({ queryKey: ['admin-parking-lots'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete lot')
    },
  })

  // Cancel Booking
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await http.delete(`/admin/bookings/${bookingId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Booking cancelled!')
      qc.invalidateQueries({ queryKey: ['admin-bookings'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking')
    },
  })

  // Delete User
  const deleteUser = useMutation({
    mutationFn: async (email: string) => {
      const res = await http.delete(`/admin/users/${email}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('User deleted!')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage parking lots, bookings, and users</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'lots', 'bookings', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total Users', value: analytics.data?.users ?? 0 },
              { label: 'Parking Lots', value: analytics.data?.parking_lots ?? 0 },
              { label: 'Total Bookings', value: analytics.data?.bookings_total ?? 0 },
              { label: 'Active Bookings', value: analytics.data?.bookings_active ?? 0 },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="text-xs text-zinc-400">{kpi.label}</div>
                <div className="mt-2 text-3xl font-semibold">{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-medium">Booking Status Distribution</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(analytics.data?.bookings_by_status ?? {}).map(([status, count]) => (
                <div key={status} className="rounded border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{count}</div>
                  <div className="mt-1 text-xs text-zinc-400 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parking Lots Tab */}
      {activeTab === 'lots' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateLot(!showCreateLot)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            + Add Parking Lot
          </button>

          {showCreateLot && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Lot Name"
                  value={lotData.lot_name}
                  onChange={(e) => setLotData({ ...lotData, lot_name: e.target.value })}
                  className="w-full rounded bg-white/10 px-3 py-2 text-sm outline-none focus:bg-white/20"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={lotData.location}
                  onChange={(e) => setLotData({ ...lotData, location: e.target.value })}
                  className="w-full rounded bg-white/10 px-3 py-2 text-sm outline-none focus:bg-white/20"
                />
                <input
                  type="number"
                  placeholder="Hourly Rate"
                  value={lotData.hourly_rate}
                  onChange={(e) => setLotData({ ...lotData, hourly_rate: parseInt(e.target.value) })}
                  className="w-full rounded bg-white/10 px-3 py-2 text-sm outline-none focus:bg-white/20"
                />
                <input
                  type="number"
                  placeholder="Total Slots"
                  value={lotData.total_slots_count}
                  onChange={(e) => setLotData({ ...lotData, total_slots_count: parseInt(e.target.value) })}
                  className="w-full rounded bg-white/10 px-3 py-2 text-sm outline-none focus:bg-white/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => createLot.mutate()}
                    disabled={createLot.isPending || !lotData.lot_name || !lotData.location}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {createLot.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreateLot(false)}
                    className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Booked</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {parkingLots.data?.map((lot) => (
                  <tr key={lot.lot_id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">{lot.lot_id}</td>
                    <td className="px-4 py-3">{lot.lot_name}</td>
                    <td className="px-4 py-3 text-zinc-400">{lot.location}</td>
                    <td className="px-4 py-3">{lot.total_slots}</td>
                    <td className="px-4 py-3 text-green-400">{lot.available_slots}</td>
                    <td className="px-4 py-3 text-red-400">{lot.booked_slots}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteLot.mutate(lot.lot_id)}
                        disabled={deleteLot.isPending}
                        className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">User Email</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.data?.map((booking) => (
                <tr key={booking.booking_id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs">{booking.booking_id}</td>
                  <td className="px-4 py-3 text-sm">{booking.user_email}</td>
                  <td className="px-4 py-3">{booking.lot_id}</td>
                  <td className="px-4 py-3 font-mono">{booking.slot_id}</td>
                  <td className="px-4 py-3 capitalize text-sm">{booking.vehicle_type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                      booking.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => cancelBooking.mutate(booking.booking_id)}
                      disabled={cancelBooking.isPending}
                      className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.data?.map((user) => (
                <tr key={user.email} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser.mutate(user.email)}
                      disabled={deleteUser.isPending || user.role === 'admin'}
                      className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
