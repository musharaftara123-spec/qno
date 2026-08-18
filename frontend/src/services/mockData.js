// ===============================
// Mock Clinic Login Credentials
// ===============================
// ⚠️ DEV/MOCK ONLY — never ship real passwords client-side. Delete once
// real JWT + bcrypt authentication exists.
export const mockClinicUser = {
  email: 'musharaf@tc.com',
  password: '12345',
  clinicId: 'clinic_1',
  clinicName: 'Sunrise Family Clinic',
  doctorName: 'Dr. Adil Rashid',
  role: 'Owner',
}

export let mockClinics = [
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

// All facility options offerable — used by both the patient-side display
// and the Clinic Profile editor's checklist.
export const ALL_FACILITY_OPTIONS = [
  'Digital Queue',
  'Online Payment',
  'Waiting Lounge',
  'Parking',
  'Pharmacy',
  'Wheelchair Access',
  'AC Waiting Area',
  'Lab Tests',
]

// Updates a clinic's public profile (shown on the patient-side ClinicDetail
// page). Mock/in-memory only — mutates the exported array in place and
// persists to localStorage so edits survive a refresh. A real backend
// would be a PUT /api/clinics/:id call instead.
const CLINIC_PROFILE_STORAGE_KEY = 'clinicQueue_clinicProfiles'

function loadPersistedClinicProfiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(CLINIC_PROFILE_STORAGE_KEY))
    if (!stored) return
    mockClinics = mockClinics.map((c) => (stored[c._id] ? { ...c, ...stored[c._id] } : c))
  } catch {
    // no-op, use defaults
  }
}
loadPersistedClinicProfiles()

export function updateClinicProfile(clinicId, updates) {
  mockClinics = mockClinics.map((c) => (c._id === clinicId ? { ...c, ...updates } : c))
  try {
    const stored = JSON.parse(localStorage.getItem(CLINIC_PROFILE_STORAGE_KEY)) || {}
    stored[clinicId] = { ...stored[clinicId], ...updates }
    localStorage.setItem(CLINIC_PROFILE_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // non-critical if storage unavailable
  }
  return mockClinics.find((c) => c._id === clinicId)
}

export function getClinicById(clinicId) {
  return mockClinics.find((c) => c._id === clinicId) || null
}

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
// Simulates a server-side appointments table, persisted to localStorage.
// Regular pages must use the single-record lookup functions. Clinic staff
// pages (Patients.jsx) use the clinic-scoped listing function, which is a
// legitimate authorized "view all patients of MY clinic" operation — not
// the same as a component silently importing raw patient data in bulk.

const STORAGE_KEY = 'clinicQueue_mockAppointments'

const SEED_APPOINTMENTS = {
  'QNO-482731': {
    appointmentId: 'APT101',
    patientId: 'QNO-482731',
    patientName: 'Musharaf Tara',
    patientPhone: '6001234567',
    patientAge: 34,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '12 Aug 2026',
    appointmentDay: 'Wednesday',
    session: '8:00 AM - 10:00 AM',
    tokenNumber: 31,
    currentToken: 18,
    fee: 500,
    status: 'waiting',
    bookedBy: 'online',
    createdAt: Date.now() - 86400000,
  },
  'QNO-482732': {
    appointmentId: 'APT102',
    patientId: 'QNO-482732',
    patientName: 'Aisha Khan',
    patientPhone: '7001234567',
    patientAge: 28,
    patientGender: 'Female',
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
    bookedBy: 'online',
    createdAt: Date.now() - 43200000,
  },
  'QNO-482733': {
    appointmentId: 'APT103',
    patientId: 'QNO-482733',
    patientName: 'Bilal Ahmad',
    patientPhone: '6009876543',
    patientAge: 41,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '16 Aug 2026',
    appointmentDay: 'Monday',
    session: '10:00 AM - 12:00 PM',
    tokenNumber: 5,
    currentToken: 5,
    fee: 500,
    status: 'your_turn',
    bookedBy: 'receptionist',
    createdAt: Date.now() - 3600000,
  },
}

function readStore() {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (existing) return existing
  } catch {
    // fall through to seeding below
  }
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
    // localStorage unavailable — non-critical for mock mode
  }
}

let mockAppointmentCounter = 1000

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
  bookedBy = 'online', // 'online' | 'receptionist'
  appointmentDate,
  appointmentDay,
}) {
  mockAppointmentCounter += 1
  const appointmentId = `appt_${mockAppointmentCounter}`
  const tokenNumber = mockAppointmentCounter - 1000
  const patientId = generatePatientId()

  const doctor = mockDoctorsByClinic[clinicId]?.doctors.find((d) => d._id === doctorId)
  const clinic = getClinicById(clinicId)

  const appointment = {
    appointmentId,
    patientId,
    tokenNumber,
    currentToken: Math.max(1, tokenNumber - 5),
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
    bookedBy,
    appointmentDate: appointmentDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    appointmentDay: appointmentDay || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    createdAt: Date.now(),
  }

  const store = readStore()
  store[patientId] = appointment
  store[appointmentId] = appointment
  writeStore(store)

  return appointment
}

// Single-record lookups — the sanctioned way for patient-facing pages to
// read appointment data (never the whole store).
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

// Clinic-scoped bulk listing — for authorized clinic staff only (the
// Patients.jsx page, gated behind ProtectedClinicRoute + login). This is
// different from a page importing ALL appointments across every clinic;
// it filters to just the requesting clinic's own records, the way a real
// GET /api/clinics/:id/appointments endpoint would behave server-side.
export function getAppointmentsForClinic(clinicId) {
  const store = readStore()
  const seen = new Set()
  const results = []
  Object.values(store).forEach((appt) => {
    if (appt.clinicId === clinicId && !seen.has(appt.appointmentId)) {
      seen.add(appt.appointmentId)
      results.push(appt)
    }
  })
  return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}