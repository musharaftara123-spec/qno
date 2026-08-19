import React, { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UserPlus, Phone, Cake, Stethoscope, CalendarDays, Clock, Users, Check, CheckCircle2, Loader2, Copy } from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import PatientQuickActions from '../../components/clinic/PatientQuickActions.jsx'
import api from '../../services/api.js'

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

export default function Appointments() {
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lastBooked, setLastBooked] = useState(null)

  useEffect(() => {
    loadDoctors()
    loadRecentAppointments()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true)
      const { data } = await api.get('/clinic/doctors')
      const doctorList = Array.isArray(data) ? data : data.doctors || []
      setDoctors(doctorList)
      if (doctorList.length > 0) setDoctorId(doctorList[0]._id)
    } catch (err) {
      toast.error('Failed to load doctors')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const loadRecentAppointments = async () => {
    try {
      setLoadingRecent(true)
      const { data } = await api.get('/clinic/appointments')
      const list = Array.isArray(data) ? data : data.appointments || []
      setRecent(list.slice(0, 8))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRecent(false)
    }
  }

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d._id) === String(doctorId)) || null,
    [doctors, doctorId]
  )

  const upcomingDates = useMemo(
    () => (selectedSession ? getUpcomingDatesForDay(selectedSession.day, 4) : []),
    [selectedSession]
  )
  const chosenDate = upcomingDates[selectedDateIdx]

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Enter patient name')
    if (!/^[6-9]\d{9}$/.test(phone)) return toast.error('Enter valid 10-digit phone')
    if (!age || Number(age) <= 0) return toast.error('Enter valid age')
    if (!gender) return toast.error('Select gender')
    if (!selectedDoctor) return toast.error('Select a doctor')
    if (!selectedDoctor.active) return toast.error('Selected doctor is currently on leave')
    if (!selectedSession) return toast.error('Select a session')
    if (!chosenDate) return toast.error('Select appointment date')

    setSubmitting(true)
    const appointmentDate = chosenDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    try {
      const { data: appointment } = await api.post('/clinic/appointments', {
        doctorId,
        patientName: name.trim(),
        patientPhone: phone.trim(),
        patientAge: Number(age),
        patientGender: gender,
        slotDay: selectedSession.day,
        session: `${selectedSession.start} - ${selectedSession.end}`,
        appointmentDate,
        bookedBy: 'receptionist',
      })

      setLastBooked(appointment)
      setRecent((prev) => [appointment, ...prev].slice(0, 8))
      toast.success(`Booked · Patient ID ${appointment.patientId}`)

      setName('')
      setPhone('')
      setAge('')
      setGender('')
      setSelectedSession(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ClinicDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Book Walk-in Appointment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} placeholder="Phone" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <option value="">Select Gender</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl sm:col-span-2">
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.specialty} {!d.active ? '(On Leave)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Sessions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(selectedDoctor?.availability || []).map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSession(s)}
                  className={`p-3 rounded-xl border cursor-pointer ${
                    selectedSession?.day === s.day && selectedSession?.start === s.start
                      ? 'border-brand-600 bg-brand-50/50'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-bold text-sm">{s.day}</p>
                  <p className="text-xs text-gray-500">{s.start} - {s.end}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedSession && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Appointment Date</p>
              <div className="flex gap-2">
                {upcomingDates.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                      selectedDateIdx === idx ? 'bg-brand-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 mt-5 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Appointments</p>
          {loadingRecent ? (
            <Loader2 className="animate-spin text-gray-400 my-8 mx-auto" />
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div key={a._id} className="text-xs border-b pb-2">
                  <p className="font-bold text-gray-900 dark:text-white">{a.patientName}</p>
                  <p className="text-gray-500">{a.doctorName} · Token #{a.tokenNumber}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicDashboardLayout>
  )
}import React, { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UserPlus, Phone, Cake, Stethoscope, CalendarDays, Clock, Users, Check, CheckCircle2, Loader2, Copy } from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import PatientQuickActions from '../../components/clinic/PatientQuickActions.jsx'
import api from '../../services/api.js'

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

export default function Appointments() {
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDateIdx, setSelectedDateIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lastBooked, setLastBooked] = useState(null)

  useEffect(() => {
    loadDoctors()
    loadRecentAppointments()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true)
      const { data } = await api.get('/clinic/doctors')
      const doctorList = Array.isArray(data) ? data : data.doctors || []
      setDoctors(doctorList)
      if (doctorList.length > 0) setDoctorId(doctorList[0]._id)
    } catch (err) {
      toast.error('Failed to load doctors')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const loadRecentAppointments = async () => {
    try {
      setLoadingRecent(true)
      const { data } = await api.get('/clinic/appointments')
      const list = Array.isArray(data) ? data : data.appointments || []
      setRecent(list.slice(0, 8))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRecent(false)
    }
  }

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d._id) === String(doctorId)) || null,
    [doctors, doctorId]
  )

  const upcomingDates = useMemo(
    () => (selectedSession ? getUpcomingDatesForDay(selectedSession.day, 4) : []),
    [selectedSession]
  )
  const chosenDate = upcomingDates[selectedDateIdx]

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Enter patient name')
    if (!/^[6-9]\d{9}$/.test(phone)) return toast.error('Enter valid 10-digit phone')
    if (!age || Number(age) <= 0) return toast.error('Enter valid age')
    if (!gender) return toast.error('Select gender')
    if (!selectedDoctor) return toast.error('Select a doctor')
    if (!selectedDoctor.active) return toast.error('Selected doctor is currently on leave')
    if (!selectedSession) return toast.error('Select a session')
    if (!chosenDate) return toast.error('Select appointment date')

    setSubmitting(true)
    const appointmentDate = chosenDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    try {
      const { data: appointment } = await api.post('/clinic/appointments', {
        doctorId,
        patientName: name.trim(),
        patientPhone: phone.trim(),
        patientAge: Number(age),
        patientGender: gender,
        slotDay: selectedSession.day,
        session: `${selectedSession.start} - ${selectedSession.end}`,
        appointmentDate,
        bookedBy: 'receptionist',
      })

      setLastBooked(appointment)
      setRecent((prev) => [appointment, ...prev].slice(0, 8))
      toast.success(`Booked · Patient ID ${appointment.patientId}`)

      setName('')
      setPhone('')
      setAge('')
      setGender('')
      setSelectedSession(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ClinicDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Book Walk-in Appointment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} placeholder="Phone" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl" />
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <option value="">Select Gender</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="h-11 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl sm:col-span-2">
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.specialty} {!d.active ? '(On Leave)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Sessions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(selectedDoctor?.availability || []).map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSession(s)}
                  className={`p-3 rounded-xl border cursor-pointer ${
                    selectedSession?.day === s.day && selectedSession?.start === s.start
                      ? 'border-brand-600 bg-brand-50/50'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-bold text-sm">{s.day}</p>
                  <p className="text-xs text-gray-500">{s.start} - {s.end}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedSession && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Appointment Date</p>
              <div className="flex gap-2">
                {upcomingDates.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDateIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                      selectedDateIdx === idx ? 'bg-brand-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 mt-5 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Recent Appointments</p>
          {loadingRecent ? (
            <Loader2 className="animate-spin text-gray-400 my-8 mx-auto" />
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div key={a._id} className="text-xs border-b pb-2">
                  <p className="font-bold text-gray-900 dark:text-white">{a.patientName}</p>
                  <p className="text-gray-500">{a.doctorName} · Token #{a.tokenNumber}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicDashboardLayout>
  )
}