import Appointment from '../models/Appointment.js'
import Doctor from '../models/Doctor.js'
import QueueState from '../models/QueueState.js'
import { ApiError } from '../utils/ApiError.js'

function todayString() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function parseQueueDate(dateString) {
  const match = String(dateString || '').match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (!match) return new Date(dateString)

  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  return new Date(Number(match[3]), months[match[2]] ?? 0, Number(match[1]))
}

function doctorConsultsOnDate(doctor, dateString) {
  const availability = Array.isArray(doctor.availability) ? doctor.availability : []
  if (!availability.length) return false

  const date = parseQueueDate(dateString)
  if (Number.isNaN(date.getTime())) return false

  const fullDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const shortDay = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

  return availability.some((slot) => {
    const configuredDay = String(slot?.day || '').trim().toLowerCase()
    if (!configuredDay) return false

    // Accept the formats used by the doctor/session UI:
    // Sunday, Sun, sunday, SUN, etc.
    return (
      configuredDay === fullDay ||
      configuredDay === shortDay ||
      configuredDay.slice(0, 3) === shortDay.slice(0, 3)
    )
  })
}

async function getState(doctorId, appointmentDate) {
  return QueueState.findOneAndUpdate(
    { doctor: doctorId, appointmentDate },
    { $setOnInsert: { doctor: doctorId, appointmentDate } },
    { upsert: true, new: true }
  )
}

function calculateAverages(completed) {
  const timed = completed
    .filter((a) => a.queueStartedAt && a.queueCompletedAt)
    .map((a) => ({
      consultation:
        Math.max(
          0,
          (new Date(a.queueCompletedAt).getTime() -
            new Date(a.queueStartedAt).getTime()) /
            60000
        ),
      wait:
        a.createdAt && a.queueStartedAt
          ? Math.max(
              0,
              (new Date(a.queueStartedAt).getTime() -
                new Date(a.createdAt).getTime()) /
                60000
            )
          : null,
    }))

  // QNO starts with a practical 5-minute planning average.
  // Once real patients complete consultations, replace the planning
  // average with the actual average of completed consultations.
  if (timed.length === 0) {
    return {
      avgConsultationMin: 5,
      avgWaitMin: 0,
      sampleSize: 0,
    }
  }

  const consultationAverage =
    timed.reduce((sum, item) => sum + item.consultation, 0) / timed.length

  const waits = timed
    .filter((item) => item.wait !== null)
    .map((item) => item.wait)

  const waitAverage =
    waits.length > 0
      ? waits.reduce((sum, value) => sum + value, 0) / waits.length
      : 0

  return {
    avgConsultationMin: Math.round(consultationAverage * 10) / 10,
    avgWaitMin: Math.round(waitAverage * 10) / 10,
    sampleSize: timed.length,
  }
}

export async function getQueueForDoctor(doctorId, appointmentDate = todayString()) {
  const doctor = await Doctor.findById(doctorId).select('name specialty active availability')
  if (!doctor) throw new ApiError(404, 'Doctor not found')

  const state = await getState(doctorId, appointmentDate)

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate,
    status: { $in: ['confirmed', 'waiting', 'your_turn', 'completed', 'cancelled'] },
  }).sort({ tokenNumber: 1 })

  const current = appointments.find((a) => a.status === 'your_turn')
  const waitingList = appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'waiting')
    .map((a) => ({
      appointmentId: String(a._id),
      patientId: a.patientId,
      patientName: a.patientName,
      patientPhone: a.patientPhone,
      patientAge: a.patientAge,
      patientGender: a.patientGender,
      token: String(a.tokenNumber),
      tokenNumber: a.tokenNumber,
      appointmentDate: a.appointmentDate,
      appointmentDay: a.appointmentDay,
      session: a.session,
      status: a.status,
    }))

  const completed = appointments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => new Date(a.queueCompletedAt || a.updatedAt) - new Date(b.queueCompletedAt || b.updatedAt))

  const averages = calculateAverages(completed)

  return {
    doctorId: String(doctor._id),
    doctorName: doctor.name,
    specialty: doctor.specialty || '',
    avgWaitMin: averages.avgWaitMin,
    avgConsultationMin: averages.avgConsultationMin,
    averageSampleSize: averages.sampleSize,
    currentToken: current
      ? {
          appointmentId: String(current._id),
          patientId: current.patientId,
          patientName: current.patientName,
          patientPhone: current.patientPhone,
          token: String(current.tokenNumber),
          tokenNumber: current.tokenNumber,
          status: 'In Progress',
          // Needed by the UI to compute how far into the consultation the
          // doctor already is, so "estimated consultation time" for the
          // waiting list can subtract elapsed time instead of assuming
          // every consultation starts fresh from "now".
          queueStartedAt: current.queueStartedAt,
        }
      : { token: '---', patientName: 'N/A', status: 'Idle', queueStartedAt: null },
    waitingList,
    waiting: waitingList.length,
    servedToday: completed.length,
    noShowToday: appointments.filter((a) => a.status === 'cancelled').length,
    isStarted: Boolean(state.isStarted),
    startedAt: state.startedAt,
    isHeld: Boolean(state.isHeld),
    isEnded: Boolean(state.isEnded),
    appointmentDate,
    isConsultingDate: doctorConsultsOnDate(doctor, appointmentDate),
  }
}

export async function startQueue(doctorId, appointmentDate = todayString()) {
  const doctor = await Doctor.findById(doctorId).select('name availability')
  if (!doctor) throw new ApiError(404, 'Doctor not found')

  const hasConfiguredSession = doctorConsultsOnDate(doctor, appointmentDate)

  // A booked session is also authoritative evidence that the doctor is
  // consulting on that date. This protects older doctor records whose
  // availability array may be missing/legacy-formatted.
  const hasBookedSession = await Appointment.exists({
    doctor: doctorId,
    appointmentDate,
    status: { $nin: ['cancelled'] },
  })

  if (!hasConfiguredSession && !hasBookedSession) {
    throw new ApiError(
      400,
      `${doctor.name} is not scheduled to consult on ${appointmentDate}. Select a date with a doctor session.`
    )
  }

  const state = await getState(doctorId, appointmentDate)
  if (state.isEnded) throw new ApiError(400, 'This queue has already ended and cannot be restarted.')
  if (state.isStarted) throw new ApiError(400, 'This queue has already been started.')

  state.isStarted = true
  state.startedAt = new Date()
  state.isHeld = false

  // Starting a queue immediately calls the first waiting patient.
  // This keeps Start Queue as the actual beginning of the consultation flow.
  const firstPatient = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    status: { $in: ['confirmed', 'waiting'] },
  }).sort({ tokenNumber: 1 })

  if (firstPatient) {
    firstPatient.status = 'your_turn'
    firstPatient.queueStartedAt = new Date()
    firstPatient.queueCompletedAt = null
    await firstPatient.save()

    state.lastAction = 'next'
    state.lastAppointmentId = firstPatient._id
    state.previousCurrentAppointmentId = null
  }

  await state.save()
  return state
}

export async function advanceQueue(doctorId, appointmentDate = todayString()) {
  const state = await getState(doctorId, appointmentDate)
  if (!state.isStarted) throw new ApiError(400, 'Start the queue before calling the next patient.')
  if (state.isEnded) throw new ApiError(400, "Today's queue has ended")
  if (state.isHeld) throw new ApiError(400, 'Queue is on hold')

  const current = await Appointment.findOne({ doctor: doctorId, appointmentDate, status: 'your_turn' })
  if (current) {
    current.status = 'completed'
    current.queueCompletedAt = new Date()
    await current.save()
  }

  const next = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    status: { $in: ['confirmed', 'waiting'] },
  }).sort({ tokenNumber: 1 })

  if (!next) return null

  next.status = 'your_turn'
  next.queueStartedAt = new Date()
  next.queueCompletedAt = null
  await next.save()

  state.lastAction = 'next'
  state.lastAppointmentId = next._id
  state.previousCurrentAppointmentId = current?._id || null
  await state.save()

  return next
}

export async function markNoShow(appointmentId) {
  const appt = await Appointment.findById(appointmentId)
  if (!appt) throw new ApiError(404, 'Appointment not found')

  const state = await getState(appt.doctor, appt.appointmentDate)
  if (!state.isStarted) throw new ApiError(400, 'Start the queue before skipping a patient.')
  if (!['confirmed', 'waiting'].includes(appt.status)) {
    throw new ApiError(400, 'Only a waiting patient can be skipped.')
  }

  appt.status = 'cancelled'
  await appt.save()

  state.lastAction = 'no_show'
  state.lastAppointmentId = appt._id
  state.previousCurrentAppointmentId = null
  await state.save()
  return appt
}

export async function toggleHold(doctorId, appointmentDate = todayString(), isHeld) {
  const state = await getState(doctorId, appointmentDate)
  if (!state.isStarted) throw new ApiError(400, 'Start the queue before putting it on hold.')
  if (state.isEnded) throw new ApiError(400, "Today's queue has ended")
  state.isHeld = Boolean(isHeld)
  await state.save()
  return state
}

export async function endQueue(doctorId, appointmentDate = todayString()) {
  const state = await getState(doctorId, appointmentDate)
  if (!state.isStarted) throw new ApiError(400, 'Start the queue before ending it.')
  state.isEnded = true
  state.isHeld = false
  await state.save()
  return state
}

export async function undoLastAction(doctorId, appointmentDate = todayString()) {
  const state = await getState(doctorId, appointmentDate)
  if (!state.lastAction || !state.lastAppointmentId) throw new ApiError(400, 'Nothing to undo.')

  if (state.lastAction === 'no_show') {
    const appt = await Appointment.findById(state.lastAppointmentId)
    if (!appt || appt.status !== 'cancelled') throw new ApiError(400, 'Nothing to undo.')
    appt.status = 'confirmed'
    await appt.save()
  }

  if (state.lastAction === 'next') {
    const promoted = await Appointment.findById(state.lastAppointmentId)
    if (promoted && promoted.status === 'your_turn') {
      promoted.status = 'confirmed'
      promoted.queueStartedAt = null
      promoted.queueCompletedAt = null
      await promoted.save()
    }

    if (state.previousCurrentAppointmentId) {
      const previous = await Appointment.findById(state.previousCurrentAppointmentId)
      if (previous && previous.status === 'completed') {
        previous.status = 'your_turn'
        previous.queueCompletedAt = null
        await previous.save()
      }
    }
  }

  state.lastAction = null
  state.lastAppointmentId = null
  state.previousCurrentAppointmentId = null
  await state.save()

  return getQueueForDoctor(doctorId, appointmentDate)
}