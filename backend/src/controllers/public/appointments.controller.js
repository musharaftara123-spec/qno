import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import * as appointmentService from '../../services/appointment.service.js'

// POST /api/appointments -> mirrors createMockAppointment() call in
// api.js's mock adapter. bookedBy defaults to 'online' here regardless of
// what the client sends, so a patient can never spoof 'receptionist' to
// dodge the slot cap.
export const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment({
    ...req.body,
    bookedBy: 'online',
  })
  res.status(201).json(appointment)
})

// GET /api/appointments/lookup/:patientId -> "Join Queue with Patient ID"
export const lookupAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.lookupByPatientId(req.params.patientId)
  if (!appointment) throw new ApiError(404, 'No appointment found for this Patient ID')
  res.json(appointment)
})

// POST /api/appointments/:id/pay -> confirms after (mock or real) payment
export const payAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.markPaid(req.params.id)
  res.json(appointment)
})
