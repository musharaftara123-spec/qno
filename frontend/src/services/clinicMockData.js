// Mock clinic-side data: per-doctor live queue state, staff/role info,
// doctor roster, and historical appointment records (for reports/PDF export).
// Separate from the patient-facing mockData.js since this represents
// what a clinic's staff sees, not what a patient books.

export const mockClinicInfo = {
  name: 'OPD General',
  ownerName: 'Ali Hassan',
}

// ⚠️ DEV/MOCK ONLY. A real backend must NEVER let the client compare
// passwords — this exists purely so ClinicLogin.jsx has accounts to test
// against before real JWT + bcrypt auth exists. Delete this once real
// authentication is wired up.
export const mockClinicAccounts = [
  {
    email: 'owner@clinic.test',
    password: '224523',
    userId: 'staff_1',
    name: 'Ali Hassan',
    role: 'owner', // sees full sidebar, can switch between all doctors' queues
    assignedDoctorIds: ['doc_1', 'doc_2', 'doc_3'], // all, since owner
  },
  {
    email: 'operator@sunrise.com',
    password: 'operator123',
    userId: 'staff_2',
    name: 'Sara Malik',
    role: 'operator', // dropped straight into assigned queue(s), limited nav
    assignedDoctorIds: ['doc_1'], // only Dr. Adil Rashid's queue
  },
]

export const mockClinicQueues = {
  doc_1: {
    doctorName: 'Dr. Adil Rashid',
    specialty: 'General Medicine',
    waiting: 12,
    avgWaitMin: 18,
    servedToday: 56,
    noShowToday: 5,
    currentToken: {
      token: 'A-023',
      patientName: 'Mr. Imran Ali',
      status: 'In Progress',
    },
    waitingList: [
      { token: 'A-024', patientName: 'Mr. Bilal Ahmad', waitMin: 12 },
      { token: 'A-025', patientName: 'Mrs. Saba Khan', waitMin: 10 },
      { token: 'A-026', patientName: 'Mr. Rehan Dar', waitMin: 9 },
      { token: 'A-027', patientName: 'Miss. Ayesha Malik', waitMin: 8 },
      { token: 'A-028', patientName: 'Mr. Faisal Sheikh', waitMin: 7 },
      { token: 'A-029', patientName: 'Mrs. Nazia Banu', waitMin: 6 },
    ],
  },
  doc_2: {
    doctorName: 'Dr. Sana Khan',
    specialty: 'Gynecologist',
    waiting: 8,
    avgWaitMin: 22,
    servedToday: 31,
    noShowToday: 2,
    currentToken: {
      token: 'B-011',
      patientName: 'Mrs. Farah Wani',
      status: 'In Progress',
    },
    waitingList: [
      { token: 'B-012', patientName: 'Mrs. Iqra Bhat', waitMin: 15 },
      { token: 'B-013', patientName: 'Miss. Zara Malik', waitMin: 13 },
      { token: 'B-014', patientName: 'Mrs. Sana Rather', waitMin: 11 },
      { token: 'B-015', patientName: 'Mrs. Hina Dar', waitMin: 9 },
    ],
  },
  doc_3: {
    doctorName: 'Dr. Imran Nazir',
    specialty: 'Orthopedic',
    waiting: 15,
    avgWaitMin: 25,
    servedToday: 40,
    noShowToday: 3,
    currentToken: {
      token: 'C-007',
      patientName: 'Mr. Owais Ahmad',
      status: 'In Progress',
    },
    waitingList: [
      { token: 'C-008', patientName: 'Mr. Junaid Lone', waitMin: 20 },
      { token: 'C-009', patientName: 'Mr. Sameer Khan', waitMin: 18 },
      { token: 'C-010', patientName: 'Mrs. Rukhsana Bano', waitMin: 15 },
      { token: 'C-011', patientName: 'Mr. Aadil Ganai', waitMin: 12 },
      { token: 'C-012', patientName: 'Mr. Tariq Mir', waitMin: 10 },
    ],
  },
}

// ---------------------------------------------------------------------------
// Doctor roster — the source of truth for the Doctors management page.
// Add/remove a doctor here (or via the UI, which mutates a local copy) and
// it drives the ClinicDoctors page, summary cards, and PDF reports.
// ---------------------------------------------------------------------------
export const mockDoctors = [
  {
    id: 'doc_1',
    name: 'Dr. Adil Rashid',
    specialty: 'General Medicine',
    active: true,
    totalSlots: 20, // appointment capacity per day
  },
  {
    id: 'doc_2',
    name: 'Dr. Sana Khan',
    specialty: 'Gynecologist',
    active: true,
    totalSlots: 15,
  },
  {
    id: 'doc_3',
    name: 'Dr. Imran Nazir',
    specialty: 'Orthopedic',
    active: false,
    totalSlots: 18,
  },
]

// ---------------------------------------------------------------------------
// Historical appointment records per doctor — this is what the report/PDF
// filters (Day / Week / Month / Year) and totals are computed from.
// Each record: how the appointment was booked (clinic walk-in desk vs the
// patient booking app) and the amount collected for it.
// Generated deterministically (seeded RNG) so numbers don't jump on every
// reload, but spread realistically across the last 12 months.
// ---------------------------------------------------------------------------

const PATIENT_NAMES = [
  'Mr. Bilal Ahmad', 'Mrs. Saba Khan', 'Mr. Rehan Dar', 'Miss. Ayesha Malik',
  'Mr. Faisal Sheikh', 'Mrs. Nazia Banu', 'Mr. Imran Ali', 'Mrs. Iqra Bhat',
  'Miss. Zara Malik', 'Mrs. Sana Rather', 'Mrs. Hina Dar', 'Mr. Junaid Lone',
  'Mr. Sameer Khan', 'Mrs. Rukhsana Bano', 'Mr. Aadil Ganai', 'Mr. Tariq Mir',
  'Mrs. Farah Wani', 'Mr. Owais Ahmad', 'Miss. Insha Jan', 'Mr. Waseem Bhat',
]

// Small seeded PRNG (mulberry32) so the mock dataset is stable across reloads.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateAppointments(doctorId, seed, daysBack = 365) {
  const rand = mulberry32(seed)
  const records = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = 0; d < daysBack; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)

    // Fewer appointments as we go further back, busier on recent days.
    const maxPerDay = d < 30 ? 6 : d < 120 ? 4 : 2
    const countToday = Math.floor(rand() * (maxPerDay + 1))

    for (let i = 0; i < countToday; i++) {
      const source = rand() > 0.45 ? 'online' : 'clinic'
      const amount = Math.round((800 + rand() * 1700) / 50) * 50 // ₹800–₹2500, rounded
      const patientName = PATIENT_NAMES[Math.floor(rand() * PATIENT_NAMES.length)]
      records.push({
        id: `${doctorId}_apt_${d}_${i}`,
        doctorId,
        date: date.toISOString(),
        patientName,
        source, // 'clinic' | 'online'
        amount,
      })
    }
  }

  return records
}

export const mockDoctorAppointments = {
  doc_1: generateAppointments('doc_1', 11),
  doc_2: generateAppointments('doc_2', 22),
  doc_3: generateAppointments('doc_3', 33),
}