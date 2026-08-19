import axios from 'axios'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // Required so the browser sends the httpOnly refresh-token cookie on
  // requests to the backend, and accepts the Set-Cookie response back.
  // Backend's CORS_ORIGIN must be an exact origin (not '*') for this to work.
  withCredentials: true,
})

// --- In-memory access token ---
// Deliberately NOT localStorage/sessionStorage: those are readable by any
// JS on the page, so an XSS bug anywhere in the app (or a malicious
// dependency) could steal the token directly. Keeping it only in a module
// variable means it disappears on a hard refresh — that's fine, because
// ClinicAuthContext calls /clinic/auth/refresh on app load to silently
// get a new one using the httpOnly cookie the JS layer can't even read.
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// On a 401 (expired access token), try exactly once to silently refresh
// via the httpOnly cookie, then replay the original request with the new
// token. If refresh also fails, give up and let the caller handle it
// (ClinicAuthContext treats this as "logged out").
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isAuthEndpoint = original?.url?.includes('/clinic/auth/')
    if (error.response?.status === 401 && !original._retried && !isAuthEndpoint) {
      original._retried = true
      try {
        // Coalesce concurrent 401s into a single refresh call
        refreshPromise = refreshPromise || api.post('/clinic/auth/refresh')
        const { data } = await refreshPromise
        refreshPromise = null
        setAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (refreshErr) {
        refreshPromise = null
        setAccessToken(null)
        return Promise.reject(refreshErr)
      }
    }

    const message = error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject({ ...error, message })
  }
)

// --- Mock adapter (dev only) — unchanged behavior, still available while
// VITE_USE_MOCKS=true. Real requests above only run once that's false. ---
if (USE_MOCKS) {
  // Mock data imports are intentionally deferred to avoid pulling mock
  // bundles into a production build that only ever uses the real API.
  const mockDataPromise = import('./mockData.js')

  api.defaults.adapter = async (config) => {
    const {
      mockClinics,
      mockDoctorsByClinic,
      mockDoctorDetail,
      createMockAppointment,
      lookupAppointmentByPatientId,
    } = await mockDataPromise

    await new Promise((resolve) => setTimeout(resolve, 400))

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
      const result = mockDoctorsByClinic[doctorsMatch[1]]
      if (!result) return Promise.reject({ message: 'Clinic not found', response: { status: 404 } })
      return respond(result)
    }

    const doctorDetailMatch = url.match(/^\/clinics\/([^/]+)\/doctor\/([^/]+)$/)
    if (method === 'get' && doctorDetailMatch) {
      const result = mockDoctorDetail[doctorDetailMatch[2]]
      if (!result) return Promise.reject({ message: 'Doctor not found', response: { status: 404 } })
      return respond(result)
    }

    if (method === 'post' && url === '/appointments') {
      const body = JSON.parse(config.data)
      const appointment = createMockAppointment(body)
      return respond(appointment, 201)
    }

    const lookupMatch = url.match(/^\/appointments\/lookup\/([^/]+)$/)
    if (method === 'get' && lookupMatch) {
      const appt = lookupAppointmentByPatientId(decodeURIComponent(lookupMatch[1]))
      if (!appt) return Promise.reject({ message: 'No appointment found for this Patient ID', response: { status: 404 } })
      return respond(appt)
    }

    return Promise.reject({ message: `No mock handler for ${method?.toUpperCase()} ${url}` })
  }
}

export default api