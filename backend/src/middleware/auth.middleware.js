import { verifyAccessToken } from '../services/auth.service.js'
import { ApiError } from '../utils/ApiError.js'
import ClinicUser from '../models/ClinicUser.js'

// Verifies the Bearer access token and attaches req.clinicUser — mirrors
// what ClinicAuthContext.jsx stores in sessionStorage on the frontend
// (userId, name, email, role, assignedDoctorIds), plus clinicId.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new ApiError(401, 'Not authenticated')

    const payload = verifyAccessToken(token) // throws if expired/invalid/wrong type
    const user = await ClinicUser.findById(payload.sub)
    if (!user) throw new ApiError(401, 'Not authenticated')

    req.clinicUser = user
    next()
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
