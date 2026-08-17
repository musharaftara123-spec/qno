// ===============================
// Mock Clinic Login Credentials
// ===============================
// ⚠️ DEV/MOCK ONLY. A real backend must NEVER let the client compare
// passwords — this exists purely so ClinicLogin.jsx has something to test
// against before real JWT + bcrypt auth exists. This whole export must be
// deleted once real authentication is wired up; it should never reach
// production even accidentally.
export const mockClinicUser = {
  email: 'owner@clinic.test',
  password: '12345',
  clinicId: 'clinic_1',
  clinicName: 'Sunrise Family Clinic',
  doctorName: 'Dr. Owner Name',
  role: 'Owner',
}

export const mockClinics = [
  {
    _id: 'clinic_1',
    name: 'Sunrise Family Clinic',
    category: 'General Clinic',
    address: '123, Main Street, Sopore, Jammu & Kashmir 193201',
    isOpen: true,
    rating: 4.6,
    reviewCount: 128,
    distanceKm: 0.6,
    timings: 'Mon - Sat · 9:00 AM - 8:00 PM',
    consultationFee: 500,
    facilities: ['Digital Queue', 'Online Payment', 'Waiting Lounge', 'Parking'],
    about:
      'Modern clinic with experienced doctors and advanced facilities, offering quick consultations and a comfortable waiting experience.',
  },
  {
    _id: 'clinic_2',
    name: 'CarePlus Multispecialty',
    category: 'Multispecialty Hospital',
    address: '45, Rajbagh Road, Srinagar, Jammu & Kashmir 190008',
    isOpen: true,
    rating: 4.8,
    reviewCount: 342,
    distanceKm: 1.2,
    timings: 'Mon - Sun · 8:00 AM - 9:00 PM',
    consultationFee: 700,
    facilities: ['Digital Queue', 'Online Payment', 'Pharmacy', 'Parking'],
    about:
      'A full-service multispecialty hospital with cardiology, orthopedics, and emergency care, staffed by senior consultants.',
  },
  {
    _id: 'clinic_3',
    name: 'Valley Dental & Skin Center',
    category: 'Dental & Dermatology',
    address: '12, Lal Chowk, Srinagar, Jammu & Kashmir 190001',
    isOpen: false,
    rating: 4.3,
    reviewCount: 76,
    distanceKm: 2.1,
    timings: 'Mon - Sat · 10:00 AM - 6:00 PM',
    consultationFee: 400,
    facilities: ['Online Payment', 'Waiting Lounge'],
    about:
      'Specialized dental and skin care center offering cosmetic and general treatments in a calm, modern setting.',
  },
]

export const mockDoctorsByClinic = {
  clinic_1: {
    clinicName: 'Sunrise Family Clinic',
    doctors: [
      {
        _id: 'doc_1',
        name: 'Dr. Adil Rashid',
        qualification: 'MBBS, MD',
        specialty: 'General Physician',
        rating: 4.8,
        fee: 500,
        availability: [
          { day: 'Tuesday', start: '4:00 PM', end: '6:00 PM', queueLength: 12 },
          { day: 'Wednesday', start: '8:00 AM', end: '10:00 AM', queueLength: 5 },
          { day: 'Friday', start: '2:00 PM', end: '5:00 PM', queueLength: 18 },
        ],
      },
      {
        _id: 'doc_2',
        name: 'Dr. Sana Khan',
        qualification: 'MBBS, DNB (Gynecologist)',
        specialty: 'Gynecologist',
        rating: 4.7,
        fee: 600,
        availability: [
          { day: 'Monday', start: '10:00 AM', end: '1:00 PM', queueLength: 8 },
          { day: 'Thursday', start: '12:00 PM', end: '3:00 PM', queueLength: 2 },
          { day: 'Saturday', start: '4:00 PM', end: '7:00 PM', queueLength: 6 },
        ],
      },
    ],
  },
  clinic_2: {
    clinicName: 'CarePlus Multispecialty',
    doctors: [
      {
        _id: 'doc_3',
        name: 'Dr. Imran Nazir',
        qualification: 'MBBS, MS (Orthopedic)',
        specialty: 'Orthopedic',
        rating: 4.6,
        fee: 700,
        availability: [
          { day: 'Monday', start: '9:00 AM', end: '12:00 PM', queueLength: 8 },
          { day: 'Wednesday', start: '2:00 PM', end: '5:00 PM', queueLength: 10 },
        ],
      },
      {
        _id: 'doc_4',
        name: 'Dr. Riya Sharma',
        qualification: 'BDS (Dentist)',
        specialty: 'Dentist',
        rating: 4.8,
        fee: 400,
        availability: [
          { day: 'Tuesday', start: '2:00 PM', end: '5:00 PM', queueLength: 3 },
          { day: 'Thursday', start: '2:00 PM', end: '5:00 PM', queueLength: 4 },
        ],
      },
    ],
  },
  clinic_3: {
    clinicName: 'Valley Dental & Skin Center',
    doctors: [
      {
        _id: 'doc_5',
        name: 'Dr. Priya Nair',
        qualification: 'MD (Dermatologist)',
        specialty: 'Dermatologist',
        rating: 4.5,
        fee: 450,
        availability: [
          { day: 'Monday', start: '4:00 PM', end: '6:00 PM', queueLength: 0 },
          { day: 'Friday', start: '10:00 AM', end: '1:00 PM', queueLength: 1 },
        ],
      },
    ],
  },
}

export const mockDoctorDetail = {
  doc_1: {
    doctor: { _id: 'doc_1', name: 'Dr. Adil Rashid', specialty: 'General Physician' },
    availableSlots: ['10:00 AM', '10:15 AM', '10:30 AM', '11:00 AM', '11:15 AM', '11:30 AM'],
  },
  doc_2: {
    doctor: { _id: 'doc_2', name: 'Dr. Sana Khan', specialty: 'Gynecologist' },
    availableSlots: ['12:00 PM', '12:15 PM', '12:30 PM'],
  },
  doc_3: {
    doctor: { _id: 'doc_3', name: 'Dr. Imran Nazir', specialty: 'Orthopedic' },
    availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM'],
  },
  doc_4: {
    doctor: { _id: 'doc_4', name: 'Dr. Riya Sharma', specialty: 'Dentist' },
    availableSlots: ['02:00 PM', '02:30 PM', '03:00 PM'],
  },
  doc_5: {
    doctor: { _id: 'doc_5', name: 'Dr. Priya Nair', specialty: 'Dermatologist' },
    availableSlots: ['04:00 PM', '04:30 PM'],
  },
}

// ===============================
// Appointment store (private — never exported in bulk)
// ===============================
// This simulates a server-side appointments table. It is persisted in
// localStorage (scoped to this browser only) and is ONLY ever accessed
// through the single-record lookup functions below — never imported and
// searched directly by a page component. That distinction matters: a page
// that imports "all appointments" ships every patient's data to every
// visitor's browser bundle; a page that calls lookupAppointmentByPatientId()
// only ever receives the one record it asked for, matching how a real
// GET /api/appointments/lookup/:patientId endpoint would behave.

const STORAGE_KEY = 'clinicQueue_mockAppointments'

// Seed data so "Join Queue with Patient ID" has something to test against
// on a fresh browser. Only written once, on first read, and only if the
// store is currently empty — never overwrites real bookings made later.
const SEED_APPOINTMENTS = {
  'QNO-482731': {
    appointmentId: 'APT101',
    patientId: 'QNO-482731',
    patientName: 'Test Patient One',
    patientPhone: '6001234567',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '12 Aug 2026',
    appointmentDay: 'Wednesday',
    session: '8:00 AM - 10:00 AM',
    tokenNumber: 20,
    currentToken: 1,
    fee: 500,
    status: 'waiting',
  },
  'QNO-482732': {
    appointmentId: 'APT102',
    patientId: 'QNO-482732',
    patientName: 'Test Patient Two',
    patientPhone: '7001234567',
    clinicId: 'clinic_2',
    clinicName: 'CarePlus Multispecialty',
    doctorId: 'doc_3',
    doctorName: 'Dr. Imran Nazir',
    appointmentDate: '14 Aug 2026',
    appointmentDay: 'Friday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 9,
    currentToken: 6,
    fee: 700,
    status: 'waiting',
  },
  'QNO-482733': {
    appointmentId: 'APT103',
    patientId: 'QNO-482733',
    patientName: 'Test Patient Three',
    patientPhone: '6009876543',
    clinicId: 'clinic_3',
    clinicName: 'Valley Dental & Skin Center',
    doctorId: 'doc_5',
    doctorName: 'Dr. Priya Nair',
    appointmentDate: '16 Aug 2026',
    appointmentDay: 'Monday',
    session: '10:00 AM - 12:00 PM',
    tokenNumber: 5,
    currentToken: 5,
    fee: 450,
    status: 'your_turn',
  },
}

function readStore() {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (existing) return existing
  } catch {
    // fall through to seeding below
  }
  // First run on this browser — seed with sample data, indexed by both
  // patientId and appointmentId so either lookup path works.
  const seeded = {}
  Object.values(SEED_APPOINTMENTS).forEach((appt) => {
    seeded[appt.patientId] = appt
    seeded[appt.appointmentId] = appt
  })
  writeStore(seeded)
  return seeded
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage unavailable (e.g. private browsing) — non-critical for mock mode
  }
}

// ===============================
// Per-slot queue counters (persisted)
// ===============================
// Tracks how many patients have booked into a specific doctor+day slot.
// Seeded from that slot's starting `queueLength` in mockDoctorsByClinic
// the first time it's booked into, then increments with every new booking
// — so a new token number reflects the "already booked" count shown on
// DoctorSelect (e.g. a slot showing "12 booked" hands out token 13 next),
// instead of resetting to 1 on every page reload.

const QUEUE_COUNTER_KEY = 'clinicQueue_slotCounters'

function readQueueCounters() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_COUNTER_KEY)) || {}
  } catch {
    return {}
  }
}

function writeQueueCounters(counters) {
  try {
    localStorage.setItem(QUEUE_COUNTER_KEY, JSON.stringify(counters))
  } catch {
    // localStorage unavailable — non-critical for mock mode
  }
}

function nextTokenForSlot(doctorId, day, baseQueueLength) {
  const counters = readQueueCounters()
  const key = `${doctorId}_${day}`

  if (counters[key] === undefined) {
    // First booking into this slot this session — seed from the
    // doctor's displayed "already booked" count.
    counters[key] = baseQueueLength ?? 0
  }

  counters[key] += 1
  writeQueueCounters(counters)
  return counters[key]
}

let mockAppointmentCounter = 1000

// Random Patient ID in the same QNO-###### format as the seed data — NOT
// derived from the appointment id, so it can't be recomputed/guessed by
// anyone who knows the appointment id pattern.
function generatePatientId() {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `QNO-${num}`
}

export function createMockAppointment({
  clinicId,
  doctorId,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  purpose,
  slotDay,
  slotQueueLength,
}) {
  mockAppointmentCounter += 1
  const appointmentId = `appt_${mockAppointmentCounter}`
  const patientId = generatePatientId()

  const doctor = mockDoctorsByClinic[clinicId]?.doctors.find((d) => d._id === doctorId)
  const clinic = mockClinics.find((c) => c._id === clinicId)

  // Fall back to the doctor's first availability slot if the caller didn't
  // pass slot info (keeps this backward-compatible with older callers).
  const fallbackSlot = doctor?.availability?.[0]
  const day = slotDay || fallbackSlot?.day || 'Unknown'
  const baseQueueLength = slotQueueLength ?? fallbackSlot?.queueLength ?? 0

  const tokenNumber = nextTokenForSlot(doctorId, day, baseQueueLength)

  const appointment = {
    appointmentId,
    patientId,
    tokenNumber,
    currentToken: 1, // the doctor's session always starts serving from token 1
    clinicId,
    clinicName: clinic?.name,
    doctorId,
    doctorName: doctor?.name,
    patientName,
    patientPhone,
    patientAge,
    patientGender,
    purpose,
    fee: doctor?.fee ?? 300,
    status: 'pending_payment',
    createdAt: Date.now(),
  }

  const store = readStore()
  store[patientId] = appointment
  store[appointmentId] = appointment
  writeStore(store)

  return appointment
}

// Single-record lookups — the only sanctioned way to read appointment data.
export function lookupAppointmentByPatientId(patientId) {
  if (!patientId) return null
  const store = readStore()
  const key = patientId.trim().toUpperCase()
  return store[key] || null
}

export function lookupAppointmentByAppointmentId(appointmentId) {
  if (!appointmentId) return null
  const store = readStore()
  return store[appointmentId] || null
}

export function markAppointmentPaid(appointmentId) {
  const store = readStore()
  const appt = store[appointmentId]
  if (!appt) return null
  appt.status = 'confirmed'
  store[appointmentId] = appt
  store[appt.patientId] = appt
  writeStore(store)
  return appt
}