import axios from 'axios'

import { env } from './env'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 25_000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

