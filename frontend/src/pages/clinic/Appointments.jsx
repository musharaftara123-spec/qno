import React, { useMemo, useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import PatientQuickActions from '../../components/clinic/PatientQuickActions.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'
import api from '../../services/api.js'
import { printConsultationSlip } from '../../utils/consultationSlip.js'

const GENDERS = ['Male', 'Female', 'Other']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [clinicProfile, setClinicProfile] = useState(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lastBooked, setLastBooked] = useState(null)
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true)
        const { data } = await api.get('/clinic/doctors')
        setDoctors(Array.isArray(data) ? data : data.doctors || [])
      } catch (error) {
        console.error('Failed to load doctors:', error)
        toast.error(
          error.response?.data?.message ||
          error.message ||
          'Failed to load doctors'
        )
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [])

  // Loaded once for the consultation-slip letterhead (clinic name,
  // address, phone/email, consultation validity). If this fails we just
  // print the slip with blanks/defaults rather than blocking booking.
  useEffect(() => {
    const loadClinicProfile = async () => {
      try {
        const { data } = await api.get('/clinic/profile')
        setClinicProfile(data)
      } catch (error) {
        console.error('Failed to load clinic profile for slip:', error)
      }
    }
    loadClinicProfile()
  }, [])

  // Recent Appointments must survive a refresh — it's not just whatever
  // was booked in this browser tab, so we pull it from the server. We
  // still prepend new bookings into `recent` locally after a successful
  // POST (see handleSubmit) so the list updates instantly without
  // waiting on a refetch.
  useEffect(() => {
    const loadRecent = async () => {
      try {
        setLoadingRecent(true)
        const { data } = await api.get('/clinic/appointments')
        const list = Array.isArray(data) ? data : data.appointments || []
        setRecent(list.slice(0, 8))
      } catch (error) {
        console.error('Failed to load recent appointments:', error)
        toast.error(
          error.response?.data?.message ||
          error.message ||
          'Failed to load recent appointments'
        )
      } finally {
        setLoadingRecent(false)
      }
    }

    loadRecent()
  }, [])

  useEffect(() => {
    if (doctors.length > 0 && !doctorId) {
      const firstActive = doctors.find((d) => d.active !== false)
      setDoctorId((firstActive || doctors[0])._id)
    }
  }, [doctors, doctorId])

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => String(d._id) === String(doctorId)) || null
  }, [doctors, doctorId])

  // Doctor.active === false means the doctor is on leave — booking must
  // be blocked on the client (and the server double-checks this too).
  const isDoctorOnLeave = !!selectedDoctor && selectedDoctor.active === false

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
    if (isDoctorOnLeave) return
    setSelectedSession(session)
    setSelectedDateIdx(0)
  }

  const isValidPhone = /^[6-9]\d{9}$/.test(phone)
  const isValidAge = age !== '' && !isNaN(age) && Number(age) > 0 && Number(age) < 120

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Please enter a valid patient name.')
      return
    }
    if (!isValidPhone) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }
    if (!isValidAge) {
      toast.error('Please enter a valid age.')
      return
    }
    if (!gender) {
      toast.error('Please select a gender.')
      return
    }
    if (!doctorId) {
      toast.error('Please select a doctor.')
      return
    }
    if (isDoctorOnLeave) {
      toast.error(`Dr. ${selectedDoctor.name} is on leave and cannot be booked right now.`)
      return
    }
    if (!selectedSession) {
      toast.error('Please select a session for the doctor.')
      return
    }
    if (!chosenDate) {
      toast.error('Please select an appointment date.')
      return
    }

    setSubmitting(true)

    const appointmentDate = chosenDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    try {
      const { data: appointment } = await api.post(
        '/clinic/appointments',
        {
          doctorId,
          patientName: name.trim(),
          patientPhone: phone.trim(),
          patientAge: Number(age),
          patientGender: gender,
          slotDay: selectedSession.day,
          appointmentDate,
        }
      )

      setLastBooked(appointment)
      setRecent((prev) => [appointment, ...prev].slice(0, 8))

      toast.success(
        `Appointment booked · Patient ID ${appointment.patientId}`
      )

      const printed = printConsultationSlip({
        clinicName: clinicProfile?.name,
        clinicCategory: clinicProfile?.category,
        clinicAddress: clinicProfile?.address,
        clinicPhone: clinicProfile?.phone,
        clinicEmail: clinicProfile?.email,
        doctorName: selectedDoctor?.name,
        doctorQualification: selectedDoctor?.qualification,
        patientName: name.trim(),
        patientAge: age,
        patientGender: gender,
        appointmentDate,
        validity: clinicProfile?.consultationValidity,
      })
      if (!printed) {
        toast.error('Please allow popups to print the consultation slip.')
      }

      setName('')
      setPhone('')
      setAge('')
      setGender('')
      setSelectedSession(null)
      setSelectedDateIdx(0)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Could not book this appointment.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const queueLink = lastBooked
    ? `${window.location.origin}/queue/${encodeURIComponent(lastBooked.patientId)}`
    : ''

  const copyLink = async () => {
    if (!queueLink) return
    try {
      await navigator.clipboard.writeText(queueLink)
      toast.success('Link copied')
    } catch {
      toast.error('Failed to copy link')
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
                className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm text-gray-900 dark:text-white"
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
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm text-gray-900 dark:text-white"
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
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                />
              </div>
            </Field>

            <Field label="Gender">
              <div className="flex items-center gap-4 h-11">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        gender === g ? 'bg-brand-600 border-brand-600' : 'border-gray-300 dark:border-gray-600'
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
                  disabled={loadingDoctors}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm text-gray-900 dark:text-white appearance-none"
                >
                  {loadingDoctors ? (
                    <option value="">Loading doctors...</option>
                  ) : doctors.length === 0 ? (
                    <option value="">No doctors available</option>
                  ) : (
                    doctors.map((d) => (
                      <option key={d._id} value={d._id} disabled={d.active === false}>
                        {d.name} — {d.specialty} {d.active === false ? '(On Leave)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </Field>
          </div>

          <div className="mt-5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Session
            </label>

            {isDoctorOnLeave ? (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 p-3.5 text-xs font-medium text-red-700 dark:text-red-400">
                Dr. {selectedDoctor.name} is currently on leave. Please choose another doctor to book an appointment.
              </div>
            ) : loadingDoctors ? (
              <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" />
                Fetching doctor sessions...
              </div>
            ) : sessions.length === 0 ? (
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
                      key={`${session.day}-${index}`}
                      onClick={() => handleSessionSelect(session)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                        isSelected
                          ? 'bg-brand-50/60 dark:bg-brand-900/30 border-brand-500 dark:border-brand-600 ring-2 ring-brand-500/20'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
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
                          <span>
                            {session.bookedSlots || 0}/{session.totalSlots || 0} booked
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectedSession && upcomingDates.length > 0 && (
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                Date ({selectedSession.day})
              </label>
              <div className="flex flex-wrap gap-2">
                {upcomingDates.map((d, idx) => (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`h-9 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
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
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isDoctorOnLeave}
            className="w-full h-12 mt-5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : isDoctorOnLeave ? 'Doctor on leave' : 'Book Appointment'}
          </button>

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
                  type="button"
                  onClick={copyLink}
                  className="h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400 cursor-pointer"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printConsultationSlip({
                      clinicName: clinicProfile?.name,
                      clinicCategory: clinicProfile?.category,
                      clinicAddress: clinicProfile?.address,
                      clinicPhone: clinicProfile?.phone,
                      clinicEmail: clinicProfile?.email,
                      doctorName: lastBooked.doctorName,
                      doctorQualification: doctors.find(
                        (d) => String(d._id) === String(lastBooked.doctorId)
                      )?.qualification,
                      patientName: lastBooked.patientName,
                      patientAge: lastBooked.patientAge,
                      patientGender: lastBooked.patientGender,
                      appointmentDate: lastBooked.appointmentDate,
                      validity: clinicProfile?.consultationValidity,
                    })
                  }
                  className="h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400 cursor-pointer whitespace-nowrap text-xs font-medium"
                >
                  Print Slip
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Recent Appointments
          </p>
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8 text-xs text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              Loading recent appointments...
            </div>
          ) : recent.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Appointments you book here will appear in this list.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((appt) => {
                const doctor = doctors.find((d) => String(d._id) === String(appt.doctorId))
                return (
                  <div
                    key={appt.appointmentId || appt._id}
                    className="flex flex-col gap-2 pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs shrink-0">
                        {appt.patientName
                          ? appt.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                          : 'P'}
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
                    <div className="pl-12">
                      <PatientQuickActions
                        clinicId={clinicId}
                        patientName={appt.patientName}
                        patientPhone={appt.patientPhone}
                        patientAge={appt.patientAge}
                        patientGender={appt.patientGender}
                        doctorName={appt.doctorName}
                        doctorQualification={doctor?.qualification}
                        appointmentDate={appt.appointmentDate}
                        clinicName={clinicProfile?.name}
                        clinicCategory={clinicProfile?.category}
                        clinicAddress={clinicProfile?.address}
                        clinicPhone={clinicProfile?.phone}
                        clinicEmail={clinicProfile?.email}
                        validity={clinicProfile?.consultationValidity}
                        size="xs"
                      />
                    </div>
                  </div>
                )
              })}
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