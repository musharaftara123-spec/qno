import Appointment from '../models/Appointment.js'
import { ApiError } from '../utils/ApiError.js'

// Current state of a doctor's queue for a given date — mirrors what
// QueueManagement.jsx / mockClinicQueues render (current token + waiting
// list), but computed live from real appointments instead of static mock
// data.
export async function getQueueForDoctor(doctorId, appointmentDate) {
  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate,
    status: { $in: ['waiting', 'your_turn', 'completed'] },
  }).sort({ tokenNumber: 1 })

  const current = appointments.find((a) => a.status === 'your_turn')
  const waiting = appointments.filter((a) => a.status === 'waiting')
  const servedToday = appointments.filter((a) => a.status === 'completed').length

  return { current, waiting, servedToday }
}

// Marks the current 'your_turn' appointment completed and promotes the
// next 'waiting' one (lowest tokenNumber) to 'your_turn'.
export async function advanceQueue(doctorId, appointmentDate) {
  const current = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    status: 'your_turn',
  })
  if (current) {
    current.status = 'completed'
    await current.save()
  }

  const next = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    status: 'waiting',
  }).sort({ tokenNumber: 1 })

  if (next) {
    next.status = 'your_turn'
    await next.save()
  }

  return next || null
}

export async function markNoShow(appointmentId) {
  const appt = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: 'cancelled' },
    { new: true }
  )
  if (!appt) throw new ApiError(404, 'Appointment not found')
  return appt
}
