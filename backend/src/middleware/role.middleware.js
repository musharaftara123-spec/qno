import { ApiError } from '../utils/ApiError.js'

// Mirrors the `ownerOnly` flags on NAV_ITEMS in ClinicDashboardLayout.jsx —
// Doctors/Settings management is owner-only; operators are limited to
// Queue/Appointments for their assignedDoctorIds.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.clinicUser || !roles.includes(req.clinicUser.role)) {
      return next(new ApiError(403, 'Not authorized for this action'))
    }
    next()
  }
}

// For operator-scoped routes: blocks an operator from acting on a doctor
// that isn't in their assignedDoctorIds. Owners bypass this check.
export function requireAssignedDoctor(getDoctorId) {
  return (req, res, next) => {
    if (req.clinicUser.role === 'owner') return next()

    const doctorId = getDoctorId(req)
    const allowed = req.clinicUser.assignedDoctorIds.map(String).includes(String(doctorId))
    if (!allowed) return next(new ApiError(403, 'Not assigned to this doctor'))
    next()
  }
}
