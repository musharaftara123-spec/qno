import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  UserPlus,
  Phone,
  Cake,
  Stethoscope,
  CalendarDays,
  Clock,
  Users,
  Check,
  MessageCircleMore,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'
import { mockDoctorsByClinic, createMockAppointment } from '../../services/mockData.js'

const GENDERS = ['Male', 'Female', 'Other']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Returns the next `count` calendar dates that fall on `dayName`
// (e.g. "Tuesday"), starting from today. Lets reception book a walk-in
// into the doctor's very next session for that day, or a few weeks out
// for a follow-up, without ever picking a day the doctor doesn't work.
function getUpcomingDatesForDay(dayName, count = 4) {
  const targetIdx = WEEKDAYS.indexOf(dayName)
  if (targetIdx === -1) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diff = (targetIdx - today.getDay() + 7) % 7
  const first = new Date(today)
  first.setDate(first.getDate() + diff)

  const dates = []
  for (let i = 0; i < count; i++) {
    const d = new Date(first)
    d.setDate(first.getDate() + i * 7)
    dates.push(d)
  }
  return dates
}

function formatDateLabel(date, isFirst) {
  const label = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return isFirst ? `${label} (Next available)` : label
}

export default function Appointments() {
  const { user } = useClinicAuth()
  const clinicId = user?.clinicId || 'clinic_1'
  const doctors = mockDoctorsByClinic[clinicId]?.doctors || []

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0]?._id || '')
  const [selectedSession, setSelectedSession] = useState(null) // { day, start, end, queueLength }
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lastBooked, setLastBooked] = useState(null)
  const [recent, setRecent] = useState([])

  const selectedDoctor = doctors.find((d) => d._id === doctorId)
  const sessions = selectedDoctor?.availability || []

  const upcomingDates = useMemo(
    () => (selectedSession ? getUpcomingDatesForDay(selectedSession.day, 4) : []),
    [selectedSession]
  )
  const chosenDate = upcomingDates[selectedDateIdx]

  const handleDoctorChange = (id) => {
    setDoctorId(id)
    setSelectedSession(null)
    setSelectedDateIdx(0)
  }

  const handleSessionSelect = (session) => {
    setSelectedSession(session)
    setSelectedDateIdx(0)
  }

  const isValidPhone = /^[0-9]{10}$/.test(phone)
  const isValidAge = age !== '' && Number(age) > 0 && Number(age) < 120
  const canSubmit =
    name.trim().length >= 2 &&
    isValidPhone &&
    isValidAge &&
    gender &&
    doctorId &&
    selectedSession &&
    chosenDate &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error(
        !selectedSession
          ? 'Please select a session (day) for the doctor first.'
          : 'Please fill in all fields correctly.'
      )
      return
    }
    setSubmitting(true)

    const appointmentDate = chosenDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    try {
      await new Promise((r) => setTimeout(r, 500)) // simulate booking + notification send

      // bookedBy: 'receptionist' — counter walk-ins are NOT subject to the
      // online booking cap (MAX_ONLINE_BOOKINGS_PER_SLOT) that applies to
      // patients booking through the app.
      const appointment = createMockAppointment({
        clinicId,
        doctorId,
        patientName: name.trim(),
        patientPhone: phone,
        patientAge: Number(age),
        patientGender: gender,
        bookedBy: 'receptionist',
        slotDay: selectedSession.day,
        slotQueueLength: selectedSession.queueLength,
        appointmentDate,
      })

      setLastBooked(appointment)
      setRecent((prev) => [appointment, ...prev].slice(0, 8))
      toast.success(`Appointment booked · Patient ID ${appointment.patientId}`)

      // Reset form
      setName('')
      setPhone('')
      setAge('')
      setGender('')
      setSelectedSession(null)
      setSelectedDateIdx(0)
    } catch (err) {
      toast.error(err.message || 'Could not book this appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const queueLink = lastBooked
    ? `${window.location.origin}/queue/${lastBooked.patientId}`
    : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(queueLink)
      toast.success('Link copied')
    } catch {
      // clipboard unavailable — non-critical
    }
  }

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Book a walk-in appointment for a patient at the counter.
            </p>
          </div>
        ),
      }}
    >
      <div className="lg:hidden mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Book a walk-in appointment for a patient at the counter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking form */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={16} className="text-brand-600 dark:text-brand-400" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Book Walk-in Appointment
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Patient Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
              />
            </Field>

            <Field label="Phone Number">
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  placeholder="10-digit mobile"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
                />
              </div>
            </Field>

            <Field label="Age">
              <div className="relative">
                <Cake size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
                />
              </div>
            </Field>

            <Field label="Gender">
              <div className="flex items-center gap-4 h-11">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        gender === g ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
                      }`}
                    >
                      {gender === g && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{g}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Doctor">
              <div className="relative">
                <Stethoscope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={doctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm appearance-none"
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {/* Session (day) picker — mirrors the patient-side "Choose Session"
              flow, driven by the doctor's actual availability, instead of
              a free-form date/time input. Reception picks the DAY/session;
              the queue token & estimated time are assigned automatically,
              same as the patient app. No slot cap applies here. */}
          <div className="mt-5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Session
            </label>

            {sessions.length === 0 ? (
              <p className="text-xs text-gray-400">
                This doctor has no availability configured.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sessions.map((session, index) => {
                  const isSelected =
                    selectedSession?.day === session.day && selectedSession?.start === session.start

                  return (
                    <div
                      key={session.day + index}
                      onClick={() => handleSessionSelect(session)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                        isSelected
                          ? 'bg-brand-50/60 dark:bg-brand-900/30 border-brand-500 dark:border-brand-600 ring-2 ring-brand-500/20'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className={isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}
                          />
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {session.day}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/80 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>
                            {session.start} - {session.end}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          <Users size={12} />
                          <span>{session.queueLength} booked</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Which occurrence of that weekday — lets reception book the very
              next session, or a few weeks ahead for a follow-up visit. */}
          {selectedSession && upcomingDates.length > 0 && (
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                Date ({selectedSession.day})
              </label>
              <div className="flex flex-wrap gap-2">
                {upcomingDates.map((d, idx) => (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`h-9 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      selectedDateIdx === idx
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {formatDateLabel(d, idx === 0)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 mt-5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-semibold transition-colors"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>

          {/* Confirmation with simulated WhatsApp/email + queue link */}
          {lastBooked && (
            <div className="mt-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm mb-2">
                <CheckCircle2 size={16} />
                Appointment confirmed — Patient ID {lastBooked.patientId}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 mb-2">
                <MessageCircleMore size={14} />
                Confirmation sent via WhatsApp/Email with the link below.
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={queueLink}
                  className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/40 text-xs text-gray-600 dark:text-gray-300"
                />
                <button
                  onClick={copyLink}
                  className="h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent appointments */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Recent Appointments
          </p>
          {recent.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Appointments you book here will appear in this list.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0"
                >
                  <span className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs shrink-0">
                    {appt.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {appt.patientName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {appt.doctorName} · {appt.appointmentDay} · Token #{appt.tokenNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicDashboardLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  )
}