import axios from 'axios'
import {
  mockClinics,
  mockDoctorsByClinic,
  mockDoctorDetail,
  createMockAppointment,
} from './mockData.js'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Mock adapter (dev only) ---
// Intercepts requests before they hit the network and returns fake data,
// so the full Patient Flow UI can be tested before the backend exists.
// Remove or set VITE_USE_MOCKS=false in .env once the real backend is ready.
if (USE_MOCKS) {
  api.defaults.adapter = async (config) => {
    await new Promise((resolve) => setTimeout(resolve, 400)) // simulate latency

    const { method, url } = config
    const respond = (data, status = 200) => ({
      data,
      status,
      statusText: 'OK',
      headers: {},
      config,
    })

    if (method === 'get' && url === '/clinics') {
      return respond(mockClinics)
    }

    const doctorsMatch = url.match(/^\/clinics\/([^/]+)\/doctors$/)
    if (method === 'get' && doctorsMatch) {
      const clinicId = doctorsMatch[1]
      const result = mockDoctorsByClinic[clinicId]
      if (!result) return Promise.reject({ message: 'Clinic not found', response: { status: 404 } })
      return respond(result)
    }

    const doctorDetailMatch = url.match(/^\/clinics\/([^/]+)\/doctor\/([^/]+)$/)
    if (method === 'get' && doctorDetailMatch) {
      const doctorId = doctorDetailMatch[2]
      const result = mockDoctorDetail[doctorId]
      if (!result) return Promise.reject({ message: 'Doctor not found', response: { status: 404 } })
      return respond(result)
    }

    if (method === 'post' && url === '/appointments') {
      const body = JSON.parse(config.data)
      const appointment = createMockAppointment(body)
      return respond(appointment, 201)
    }

    return Promise.reject({ message: `No mock handler for ${method?.toUpperCase()} ${url}` })
  }
}

// Attach clinic/admin JWT token if present (patients don't have tokens)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling — surface API errors in a consistent shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject({ ...error, message })
  }
)

export default api