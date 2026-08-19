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
    phone: '01954-220011',
    email: 'contact@sunrisefamilyclinic.in',
    isOpen: true,
    rating: 4.6,
    reviewCount: 128,
    distanceKm: 0.6,
    timings: 'Mon - Sat · 9:00 AM - 8:00 PM',
    consultationFee: 500,
    // How many visits a single printed consultation slip stays valid for
    // (shown on the slip and used by reception to decide whether a repeat
    // visit within that window needs a fresh consultation).
    consultationValidity: 1,
    facilities: ['Digital Queue', 'Online Payment', 'Waiting Lounge', 'Parking'],
    about:
      'Modern clinic with experienced doctors and advanced facilities, offering quick consultations and a comfortable waiting experience.',
  },
  {
    _id: 'clinic_2',
    name: 'CarePlus Multispecialty',
    category: 'Multispecialty Hospital',
    address: '45, Rajbagh Road, Srinagar, Jammu & Kashmir 190008',
    phone: '0194-2450022',
    email: 'info@careplusmultispecialty.in',
    isOpen: true,
    rating: 4.8,
    reviewCount: 342,
    distanceKm: 1.2,
    timings: 'Mon - Sun · 8:00 AM - 9:00 PM',
    consultationFee: 700,
    consultationValidity: 2,
    facilities: ['Digital Queue', 'Online Payment', 'Pharmacy', 'Parking'],
    about:
      'A full-service multispecialty hospital with cardiology, orthopedics, and emergency care, staffed by senior consultants.',
  },
  {
    _id: 'clinic_3',
    name: 'Valley Dental & Skin Center',
    category: 'Dental & Dermatology',
    address: '12, Lal Chowk, Srinagar, Jammu & Kashmir 190001',
    phone: '0194-2478833',
    email: 'hello@valleydentalskin.in',
    isOpen: false,
    rating: 4.3,
    reviewCount: 76,
    distanceKm: 2.1,
    timings: 'Mon - Sat · 10:00 AM - 6:00 PM',
    consultationFee: 400,
    consultationValidity: 1,
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

// Options for the "Consultation Slip Validity" setting in Clinic Profile —
// how many visits a single printed consultation slip covers before the
// patient needs a fresh one. Used to populate the dropdown there, and the
// chosen clinic value is what gets printed on the slip itself.
export const CONSULTATION_VALIDITY_OPTIONS = [
  { value: 1, label: '1 Visit' },
  { value: 2, label: '2 Visits' },
  { value: 3, label: '3 Visits' },
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

// waitTimeMinutes = actual minutes the patient spent in the queue before
// being seen (checked-in time -> consultation start). Used to compute the
// "Average Waiting Time" stat on the clinic Patients page.
const DAY_MS = 86400000
const HOUR_MS = 3600000

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
    waitTimeMinutes: 22,
    createdAt: Date.now() - 1 * DAY_MS,
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
    waitTimeMinutes: 35,
    createdAt: Date.now() - 12 * HOUR_MS,
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
    waitTimeMinutes: 14,
    createdAt: Date.now() - 1 * HOUR_MS,
  },
  // --- Extra seed data below: mostly Sunrise Family Clinic (clinic_1) so
  // the Patients page (and its Day/Week/Month/Year filter) has enough
  // realistic records to actually demonstrate each bucket. ---
  'QNO-500101': {
    appointmentId: 'APT104',
    patientId: 'QNO-500101',
    patientName: 'Rukhsana Bano',
    patientPhone: '9906123456',
    patientAge: 52,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '18 Aug 2026',
    appointmentDay: 'Tuesday',
    session: '10:00 AM - 1:00 PM',
    tokenNumber: 4,
    currentToken: 4,
    fee: 600,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 18,
    createdAt: Date.now() - 3 * HOUR_MS,
  },
  'QNO-500102': {
    appointmentId: 'APT105',
    patientId: 'QNO-500102',
    patientName: 'Owais Ahanger',
    patientPhone: '9797654321',
    patientAge: 19,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '18 Aug 2026',
    appointmentDay: 'Tuesday',
    session: '4:00 PM - 6:00 PM',
    tokenNumber: 11,
    currentToken: 9,
    fee: 500,
    status: 'waiting',
    bookedBy: 'receptionist',
    waitTimeMinutes: 27,
    createdAt: Date.now() - 30 * 60000,
  },
  'QNO-500103': {
    appointmentId: 'APT106',
    patientId: 'QNO-500103',
    patientName: 'Farah Jan',
    patientPhone: '9622345678',
    patientAge: 30,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '16 Aug 2026',
    appointmentDay: 'Sunday',
    session: '4:00 PM - 7:00 PM',
    tokenNumber: 6,
    currentToken: 6,
    fee: 600,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 40,
    createdAt: Date.now() - 2 * DAY_MS,
  },
  'QNO-500104': {
    appointmentId: 'APT107',
    patientId: 'QNO-500104',
    patientName: 'Tariq Wani',
    patientPhone: '9018765432',
    patientAge: 47,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '14 Aug 2026',
    appointmentDay: 'Friday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 22,
    currentToken: 22,
    fee: 500,
    status: 'completed',
    bookedBy: 'receptionist',
    waitTimeMinutes: 31,
    createdAt: Date.now() - 4 * DAY_MS,
  },
  'QNO-500105': {
    appointmentId: 'APT108',
    patientId: 'QNO-500105',
    patientName: 'Insha Mir',
    patientPhone: '9797012345',
    patientAge: 25,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '12 Aug 2026',
    appointmentDay: 'Wednesday',
    session: '10:00 AM - 1:00 PM',
    tokenNumber: 3,
    currentToken: 3,
    fee: 600,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 9,
    createdAt: Date.now() - 6 * DAY_MS,
  },
  'QNO-500106': {
    appointmentId: 'APT109',
    patientId: 'QNO-500106',
    patientName: 'Sameer Dar',
    patientPhone: '9622987654',
    patientAge: 38,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '08 Aug 2026',
    appointmentDay: 'Saturday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 15,
    currentToken: 15,
    fee: 500,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 24,
    createdAt: Date.now() - 10 * DAY_MS,
  },
  'QNO-500107': {
    appointmentId: 'APT110',
    patientId: 'QNO-500107',
    patientName: 'Nusrat Jan',
    patientPhone: '7006543210',
    patientAge: 60,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '01 Aug 2026',
    appointmentDay: 'Saturday',
    session: '4:00 PM - 7:00 PM',
    tokenNumber: 7,
    currentToken: 7,
    fee: 600,
    status: 'completed',
    bookedBy: 'receptionist',
    waitTimeMinutes: 33,
    createdAt: Date.now() - 17 * DAY_MS,
  },
  'QNO-500108': {
    appointmentId: 'APT111',
    patientId: 'QNO-500108',
    patientName: 'Junaid Malik',
    patientPhone: '9797223344',
    patientAge: 33,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '25 Jul 2026',
    appointmentDay: 'Saturday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 19,
    currentToken: 19,
    fee: 500,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 20,
    createdAt: Date.now() - 24 * DAY_MS,
  },
  'QNO-500109': {
    appointmentId: 'APT112',
    patientId: 'QNO-500109',
    patientName: 'Shazia Rather',
    patientPhone: '9018112233',
    patientAge: 29,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '05 Jun 2026',
    appointmentDay: 'Friday',
    session: '12:00 PM - 3:00 PM',
    tokenNumber: 10,
    currentToken: 10,
    fee: 600,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 16,
    createdAt: Date.now() - 74 * DAY_MS,
  },
  'QNO-500110': {
    appointmentId: 'APT113',
    patientId: 'QNO-500110',
    patientName: 'Waseem Bhat',
    patientPhone: '9622556677',
    patientAge: 45,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '20 Apr 2026',
    appointmentDay: 'Monday',
    session: '4:00 PM - 6:00 PM',
    tokenNumber: 14,
    currentToken: 14,
    fee: 500,
    status: 'completed',
    bookedBy: 'receptionist',
    waitTimeMinutes: 29,
    createdAt: Date.now() - 120 * DAY_MS,
  },
  'QNO-500111': {
    appointmentId: 'APT114',
    patientId: 'QNO-500111',
    patientName: 'Iqra Fayaz',
    patientPhone: '7006998877',
    patientAge: 22,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '02 Feb 2026',
    appointmentDay: 'Monday',
    session: '10:00 AM - 1:00 PM',
    tokenNumber: 2,
    currentToken: 2,
    fee: 600,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 11,
    createdAt: Date.now() - 197 * DAY_MS,
  },
  'QNO-500112': {
    appointmentId: 'APT115',
    patientId: 'QNO-500112',
    patientName: 'Suhail Ganai',
    patientPhone: '9797445566',
    patientAge: 55,
    patientGender: 'Male',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_1',
    doctorName: 'Dr. Adil Rashid',
    appointmentDate: '10 Dec 2025',
    appointmentDay: 'Wednesday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 27,
    currentToken: 27,
    fee: 500,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 37,
    createdAt: Date.now() - 251 * DAY_MS,
  },
  'QNO-500113': {
    appointmentId: 'APT116',
    patientId: 'QNO-500113',
    patientName: 'Adeeba Shah',
    patientPhone: '9018223344',
    patientAge: 27,
    patientGender: 'Female',
    clinicId: 'clinic_1',
    clinicName: 'Sunrise Family Clinic',
    doctorId: 'doc_2',
    doctorName: 'Dr. Sana Khan',
    appointmentDate: '15 Sep 2025',
    appointmentDay: 'Monday',
    session: '12:00 PM - 3:00 PM',
    tokenNumber: 8,
    currentToken: 8,
    fee: 600,
    status: 'completed',
    bookedBy: 'receptionist',
    waitTimeMinutes: 15,
    createdAt: Date.now() - 337 * DAY_MS,
  },
  // A little cross-clinic data too, so filtering isn't 100% Sunrise-only
  'QNO-500114': {
    appointmentId: 'APT117',
    patientId: 'QNO-500114',
    patientName: 'Zoya Peerzada',
    patientPhone: '9622778899',
    patientAge: 31,
    patientGender: 'Female',
    clinicId: 'clinic_2',
    clinicName: 'CarePlus Multispecialty',
    doctorId: 'doc_4',
    doctorName: 'Dr. Riya Sharma',
    appointmentDate: '17 Aug 2026',
    appointmentDay: 'Monday',
    session: '2:00 PM - 5:00 PM',
    tokenNumber: 3,
    currentToken: 3,
    fee: 400,
    status: 'completed',
    bookedBy: 'online',
    waitTimeMinutes: 13,
    createdAt: Date.now() - 1 * DAY_MS - 5 * HOUR_MS,
  },
  'QNO-500115': {
    appointmentId: 'APT118',
    patientId: 'QNO-500115',
    patientName: 'Mudasir Lone',
    patientPhone: '7006334455',
    patientAge: 36,
    patientGender: 'Male',
    clinicId: 'clinic_3',
    clinicName: 'Valley Dental & Skin Center',
    doctorId: 'doc_5',
    doctorName: 'Dr. Priya Nair',
    appointmentDate: '11 Aug 2026',
    appointmentDay: 'Tuesday',
    session: '10:00 AM - 1:00 PM',
    tokenNumber: 1,
    currentToken: 1,
    fee: 450,
    status: 'completed',
    bookedBy: 'receptionist',
    waitTimeMinutes: 8,
    createdAt: Date.now() - 7 * DAY_MS,
  },
}

// Estimate a wait time for legacy records that predate the waitTimeMinutes
// field, so averages never silently show 0 min just because a record is old.
function estimateWaitMinutes(appt) {
  const token = appt.tokenNumber || 10
  const seen = Math.max(1, token - 5)
  return Math.max(5, Math.round((token - seen) * 4))
}

function readStore() {
  let store = null
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    store = null
  }
  if (!store || typeof store !== 'object') store = {}

  // Merge in any seed records the store doesn't already have. This runs
  // every read (not just on a completely empty store) so that new seed
  // data added later — like the extra history added for the Patients page
  // filters — actually shows up for people who already have older mock
  // data saved in their browser, instead of being silently shadowed by it.
  let changed = false
  Object.values(SEED_APPOINTMENTS).forEach((appt) => {
    if (!store[appt.appointmentId]) {
      store[appt.patientId] = appt
      store[appt.appointmentId] = appt
      changed = true
    }
  })

  // Backfill wait time on any legacy record (real bookings made before this
  // field existed, or older seed data) so it contributes to the average
  // instead of quietly dragging it toward 0.
  Object.keys(store).forEach((key) => {
    const appt = store[key]
    if (appt && typeof appt.waitTimeMinutes !== 'number') {
      appt.waitTimeMinutes = estimateWaitMinutes(appt)
      changed = true
    }
  })

  if (changed) writeStore(store)
  return store
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
    // Estimated wait, same idea as a real queue would report: roughly a few
    // minutes per patient still ahead in the token line.
    waitTimeMinutes: Math.max(5, Math.round((tokenNumber - Math.max(1, tokenNumber - 5)) * 4)),
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