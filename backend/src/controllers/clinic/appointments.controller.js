import { asyncHandler } from '../../utils/asyncHandler.js'
import * as appointmentService from '../../services/appointment.service.js'

// GET /api/clinic/appointments -> Patients.jsx table (filters: doctorId,
// source, year, search handled client-side same as today; server-side
// filters supported here for when that list gets large).
export const listAppointments = asyncHandler(async (req, res) => {
  const { doctorId, source, year } = req.query
  const appointments = await appointmentService.getAppointmentsForClinic(req.clinicUser.clinic, {
    doctorId,
    bookedBy: source,
    year,
  })
  res.json(appointments)
})

// POST /api/clinic/appointments -> receptionist walk-in booking
// (Appointments.jsx). bookedBy is forced server-side to 'receptionist' —
// same reasoning as the public controller forcing 'online' — so the slot
// cap can never be bypassed or applied by a client-supplied value.
export const createWalkInAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment({
    ...req.body,
    clinicId: req.clinicUser.clinic,
    bookedBy: 'receptionist',
  })
  res.status(201).json(appointment)
})

// PATCH /api/clinic/appointments/:id/payment -> "Online"/"Offline" buttons
// in the Payments report (DoctorReportDrawer in ClinicDoctors.jsx).
export const collectAppointmentPayment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.collectPayment(
    req.params.id,
    req.clinicUser.clinic,
    req.body.method
  )
  res.json(appointment)
})