import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Public (patient-facing, no auth)
import clinicsPublicRoutes from './routes/public/clinics.routes.js'
import appointmentsPublicRoutes from './routes/public/appointments.routes.js'

// Clinic portal (JWT-protected)
import authRoutes from './routes/clinic/auth.routes.js'
import profileRoutes from './routes/clinic/profile.routes.js'
import doctorsClinicRoutes from './routes/clinic/doctors.routes.js'
import appointmentsClinicRoutes from './routes/clinic/appointments.routes.js'
import queueRoutes from './routes/clinic/queue.routes.js'

export function createApp() {
  const app = express()

  // Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
  // etc. Free hardening with zero behavior change for legitimate requests.
  app.use(helmet())

  // `credentials: true` is required for the browser to send/receive the
  // httpOnly refresh-token cookie cross-origin (frontend on :5173, backend
  // on :5000). CORS_ORIGIN must be an exact origin, not '*', when
  // credentials are enabled — the browser will silently reject '*' + cookies.
  app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }))

  app.use(cookieParser())
  app.use(express.json())
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

  app.get('/health', (req, res) => res.json({ status: 'ok' }))

  // Matches api.js baseURL: '/api' + the exact paths its mock adapter
  // intercepts (/clinics, /clinics/:id/doctors, /appointments, ...).
  app.use('/api/clinics', clinicsPublicRoutes)
  app.use('/api/appointments', appointmentsPublicRoutes)

  app.use('/api/clinic/auth', authRoutes)
  app.use('/api/clinic/profile', profileRoutes)
  app.use('/api/clinic/doctors', doctorsClinicRoutes)
  app.use('/api/clinic/appointments', appointmentsClinicRoutes)
  app.use('/api/clinic/queue', queueRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
