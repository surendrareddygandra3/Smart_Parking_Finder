import { create } from 'zustand'

export type AuthUser = {
  email: string
  role: string
  sub?: string
}

type AuthState = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}))
