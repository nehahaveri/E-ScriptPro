import axios from 'axios'

const resolveBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8081/api`
  }

  return 'http://localhost:8081/api'
}

const baseURL = resolveBaseURL()

const api = axios.create({
  baseURL,
  timeout: 15000,
})

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
