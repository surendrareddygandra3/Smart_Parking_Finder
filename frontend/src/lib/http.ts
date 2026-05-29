import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from './env'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 25_000,
})

let refreshing = false

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      localStorage.removeItem('access_token')
      return Promise.reject(error)
    }

    if (refreshing) {
      return Promise.reject(error)
    }

    refreshing = true
    original._retry = true
    try {
      const res = await axios.post(`${env.apiBaseUrl}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      const { access_token, refresh_token } = res.data as {
        access_token: string
        refresh_token: string
      }
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${access_token}`
      return http(original)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return Promise.reject(error)
    } finally {
      refreshing = false
    }
  },
)
