import Doctor from '../models/Doctor.js'
import Clinic from '../models/Clinic.js'
import Appointment from '../models/Appointment.js'
import SlotCounter from '../models/SlotCounter.js'
import { ApiError } from '../utils/ApiError.js'
import { generatePatientId } from '../utils/generatePatientId.js'

// Same value as MAX_ONLINE_BOOKINGS_PER_SLOT in mockData.js. Online
// bookings are capped per doctor+day slot; receptionist walk-ins are not.
export const MAX_ONLINE_BOOKINGS_PER_SLOT = 30

// SlotCounter schema fields are { clinicId, key, seq } — NOT
// { doctor, day, count }. `key` scopes the counter to one doctor+day so
// every session starts its own queue at 1.
function slotKey(doctorId, day) {
  return `${doctorId}_${day}`
}

// Read-only peek at the current count, used only for the pre-check below.
// Does NOT increment — incrementing happens in claimNextToken(), and only
// once we're sure the appointment itself will be saved.
async function peekSlotCount(clinicId, doctorId, day) {
  const existing = await SlotCounter.findOne({ clinicId, key: slotKey(doctorId, day) })
  return existing?.seq || 0
}

// Atomically increments (or creates) the counter for one clinic+doctor+day
// slot and returns the new count as the token number. Using
// findOneAndUpdate with $inc means two simultaneous bookings can never
// read-then-write the same stale count — the DB serializes it.
async function claimNextToken(clinicId, doctorId, day) {
  const updated = await SlotCounter.findOneAndUpdate(
    { clinicId, key: slotKey(doctorId, day) },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  return updated.seq
}

// Compensating rollback for claimNextToken() — used if we claimed a token
// but the appointment write that was supposed to use it then failed, so a
// later successful booking doesn't get pushed past the number it should
// have had (e.g. queue jumping straight to 12 for the first real booking).
async function releaseToken(clinicId, doctorId, day) {
  await SlotCounter.updateOne(
    { clinicId, key: slotKey(doctorId, day), seq: { $gt: 0 } },
    { $inc: { seq: -1 } }
  )
}

export async function createAppointment({
  clinicId,
  doctorId,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  purpose,
  slotDay,
  appointmentDate,
  bookedBy = 'online',
}) {
  const [doctor, clinic] = await Promise.all([
    Doctor.findOne({ _id: doctorId, clinic: clinicId }),
    Clinic.findById(clinicId),
  ])

  if (!doctor) throw new ApiError(404, 'Doctor not found')
  if (!clinic) throw new ApiError(404, 'Clinic not found')

  // Doctor.active === false means the doctor is on leave. Block booking
  // here so it can never be bypassed, regardless of what the client UI
  // does or which controller (public/online vs clinic/walk-in) called in.
  if (!doctor.active) {
    throw new ApiError(
      400,
      `Dr. ${doctor.name} is currently on leave and not accepting appointments. Please choose another doctor.`,
      'DOCTOR_ON_LEAVE'
    )
  }

  const matchedSlot = doctor.availability.find((s) => s.day === slotDay) || doctor.availability[0]
  if (!matchedSlot) throw new ApiError(400, 'This doctor has no availability configured')

  const day = slotDay || matchedSlot.day
  const session = `${matchedSlot.start} - ${matchedSlot.end}`

  const isOnlineBooking = bookedBy !== 'receptionist'
  if (isOnlineBooking) {
    const currentCount = await peekSlotCount(clinic._id, doctor._id, day)
    if (currentCount >= MAX_ONLINE_BOOKINGS_PER_SLOT) {
      throw new ApiError(
        409,
        `This session is fully booked online (max ${MAX_ONLINE_BOOKINGS_PER_SLOT} patients). Please choose another day or contact the clinic directly.`,
        'SLOT_FULL'
      )
    }
  }

  const patientId = await generatePatientId()

  // Claim the token only now — everything above this point is read-only
  // checks, so nothing has "used up" a queue number yet.
  const tokenNumber = await claimNextToken(clinic._id, doctor._id, day)

  let appointment
  try {
    appointment = await Appointment.create({
      patientId,
      clinic: clinic._id,
      clinicName: clinic.name,
      doctor: doctor._id,
      // Plain string mirror of `doctor` — several frontend pages
      // (Appointments.jsx, Patients.jsx, ClinicDoctors.jsx) read
      // `appt.doctorId` directly off the API response, so this avoids
      // needing a populate() everywhere just to look up the doctor.
      doctorId: doctor._id,
      doctorName: doctor.name,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      purpose,
      appointmentDate,
      appointmentDay: day,
      session,
      tokenNumber,
      currentToken: 1,
      fee: doctor.fee,
      bookedBy,
      // Walk-ins are already confirmed in person — only the online flow
      // needs a separate payment step before that.
      status: bookedBy === 'receptionist' ? 'confirmed' : 'pending_payment',
    })
  } catch (err) {
    // Appointment write failed after we'd already claimed a token number —
    // give it back so the next successful booking doesn't skip ahead.
    await releaseToken(clinic._id, doctor._id, day)
    throw err
  }

  // Keep the doctor's per-session "booked/total" counter (shown as
  // "X/10 booked" on the Appointments session cards) in sync. $ matches
  // the array element whose day equals this slot's day, so only that
  // session's count moves.
  await Doctor.updateOne(
    { _id: doctor._id, 'availability.day': day },
    { $inc: { 'availability.$.bookedSlots': 1 } }
  )

  return appointment
}

export async function lookupByPatientId(patientId) {
  if (!patientId) return null
  return Appointment.findOne({ patientId: patientId.trim().toUpperCase() })
}

export async function markPaid(appointmentId) {
  const appt = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: 'confirmed' },
    { new: true }
  )
  if (!appt) throw new ApiError(404, 'Appointment not found')
  return appt
}

// Clinic-side "mark this visit's fee as collected" — used by the Payments
// report in ClinicDoctors.jsx (DoctorReportDrawer). Scoped to the calling
// clinic so one clinic can never mark another clinic's appointment paid.
export async function collectPayment(appointmentId, clinicId, method) {
  if (!['online', 'offline'].includes(method)) {
    throw new ApiError(400, "Payment method must be 'online' or 'offline'")
  }
  const appt = await Appointment.findOneAndUpdate(
    { _id: appointmentId, clinic: clinicId },
    { paymentMethod: method, paidAt: new Date(), status: 'confirmed' },
    { new: true }
  )
  if (!appt) throw new ApiError(404, 'Appointment not found')
  return appt
}

// Clinic-scoped bulk read — used by the clinic Patients/Doctors pages.
// Scoped strictly by clinicId, same rule as getAppointmentsForClinic() in
// mockData.js: a clinic can only ever see its own appointments.
export async function getAppointmentsForClinic(clinicId, { doctorId, bookedBy, year } = {}) {
  const query = { clinic: clinicId }
  if (doctorId) query.doctor = doctorId
  if (bookedBy) query.bookedBy = bookedBy
  if (year) {
    query.createdAt = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${Number(year) + 1}-01-01`),
    }
  }
  return Appointment.find(query).sort({ createdAt: -1 })
}