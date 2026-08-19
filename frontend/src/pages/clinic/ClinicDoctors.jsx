import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  Plus,
  Trash2,
  X,
  Power,
  Search,
  FileDown,
  BarChart3,
  CalendarClock,
  Clock,
  ChevronRight,
  Pencil,
  IndianRupee,
  Phone,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { WEEKDAY_ORDER } from '../../services/clinicMockData.js'
import api from '../../services/api.js'

const currency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)

const RANGES = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const rangeLabel = (range) => RANGES.find((r) => r.key === range)?.label ?? range

function isInRange(dateStr, range) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (range === 'day') return d >= startOfToday && d <= endOfToday
  if (range === 'week') {
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    return d >= startOfWeek
  }
  if (range === 'month') return d >= new Date(now.getFullYear(), now.getMonth(), 1)
  if (range === 'year') return d >= new Date(now.getFullYear(), 0, 1)
  return true
}

function filterAppointments(records, range) {
  return (records || [])
    .filter((r) => isInRange(r.date, range))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function summarize(records = []) {
  const totalPatients = records.length
  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0)
  const clinicCount = records.filter((r) => r.source === 'clinic').length
  const onlineCount = records.filter((r) => r.source === 'online').length
  return { totalPatients, totalAmount, clinicCount, onlineCount }
}

function exportDoctorPdf(doctor, records = [], range) {
  const doc = new jsPDF()
  const { totalPatients, totalAmount, clinicCount, onlineCount } = summarize(records)

  doc.setFontSize(14)
  doc.text(`${doctor.name}`, 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`${doctor.specialty} - ${rangeLabel(range)} report`, 14, 22)
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 27)

  doc.setTextColor(20)
  doc.setFontSize(11)
  doc.text(`Total Patients: ${totalPatients}`, 14, 36)
  doc.text(`Total Amount: ${currency(totalAmount)}`, 90, 36)
  doc.text(`Clinic Visits: ${clinicCount}`, 14, 42)
  doc.text(`Online Bookings: ${onlineCount}`, 90, 42)

  const tableFn = autoTable.default || autoTable
  tableFn(doc, {
    startY: 48,
    head: [['Date', 'Patient', 'Source', 'Amount']],
    body: records.map((r) => [
      r.date ? new Date(r.date).toLocaleDateString('en-IN') : 'N/A',
      r.patientName || 'Unknown',
      r.source === 'clinic' ? 'Clinic' : 'Online',
      currency(r.amount),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  doc.save(`${doctor.name.replace(/\s+/g, '_')}_${range}_report.pdf`)
}

function sortByWeekday(sessions, fromToday = false) {
  const list = [...(sessions || [])]
  if (!fromToday) {
    return list.sort((a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day))
  }
  const todayIdx = WEEKDAY_ORDER.indexOf(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  return list.sort((a, b) => {
    const ai = (WEEKDAY_ORDER.indexOf(a.day) - todayIdx + 7) % 7
    const bi = (WEEKDAY_ORDER.indexOf(b.day) - todayIdx + 7) % 7
    return ai - bi
  })
}

function getNextAvailableSession(availability = []) {
  const ordered = sortByWeekday(availability, true)
  return ordered.find((s) => (s.bookedSlots || 0) < (s.totalSlots || 0)) || null
}

function weeklyTotals(availability = []) {
  const totalSlots = availability.reduce((sum, s) => sum + (s.totalSlots || 0), 0)
  const bookedSlots = availability.reduce((sum, s) => sum + (s.bookedSlots || 0), 0)
  const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0
  return { totalSlots, bookedSlots, occupancy }
}

function DoctorFormModal({ mode = 'add', initial, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    specialty: initial?.specialty || '',
    qualification: initial?.qualification || '',
    phone: initial?.phone || '',
    fee: initial?.fee ?? '',
    totalSlots: initial?.totalSlots ?? 15,
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.specialty.trim()) return
    onSubmit({
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      qualification: form.qualification.trim(),
      phone: form.phone.trim(),
      fee: form.fee === '' ? undefined : Number(form.fee) || 0,
      totalSlots: Number(form.totalSlots) || 1,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {mode === 'edit' ? 'Edit Doctor' : 'Add Doctor'}
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Doctor Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Dr. Full Name"
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Specialty</label>
            <input
              required
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              placeholder="e.g. Cardiologist"
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Qualification</label>
            <input
              value={form.qualification}
              onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
              placeholder="e.g. MBBS, MD"
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Optional"
                className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Fee (₹)</label>
              <input
                type="number"
                min={0}
                value={form.fee}
                onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
                placeholder="Optional"
                className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Total Slots / Day</label>
            <input
              type="number"
              min={1}
              required
              value={form.totalSlots}
              onChange={(e) => setForm((f) => ({ ...f, totalSlots: e.target.value }))}
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          {mode === 'add' && (
            <p className="text-[11px] text-gray-400 leading-snug">
              You can set up this doctor's day-wise weekly schedule (which days, what time, how many slots) right after adding them — just tap on their card.
            </p>
          )}

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            {mode === 'edit' ? 'Save Changes' : 'Add Doctor'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function DoctorReportDrawer({ doctor, records = [], onClose }) {
  const [range, setRange] = useState('day')
  if (!doctor) return null

  const filtered = filterAppointments(records, range)
  const { totalPatients, totalAmount, clinicCount, onlineCount } = summarize(filtered)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{doctor.name}</p>
            <p className="text-xs text-gray-400">{doctor.specialty} · Appointment report</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === r.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => exportDoctorPdf(doctor, filtered, range)}
            disabled={filtered.length === 0}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            <FileDown size={13} />
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Patients</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{totalPatients}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Amount</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{currency(totalAmount)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Clinic</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{clinicCount}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Online</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{onlineCount}</p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">No appointments in this range.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2 pr-2 font-medium">Date</th>
                  <th className="py-2 pr-2 font-medium">Patient</th>
                  <th className="py-2 pr-2 font-medium">Source</th>
                  <th className="py-2 pr-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id || r._id} className="border-b border-gray-50 dark:border-gray-800/60">
                    <td className="py-2 pr-2 text-gray-600 dark:text-gray-300">
                      {new Date(r.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2 pr-2 text-gray-900 dark:text-white">{r.patientName}</td>
                    <td className="py-2 pr-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          r.source === 'clinic'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}
                      >
                        {r.source === 'clinic' ? 'Clinic' : 'Online'}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-900 dark:text-white font-medium">
                      {currency(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function DoctorSlotsDrawer({ doctor, onClose, onSave }) {
  const [sessions, setSessions] = useState(() =>
    sortByWeekday(doctor.availability || []).map((s, i) => ({
      ...s,
      _key: `${doctor._id || doctor.id}_${i}_${Date.now()}`,
    }))
  )

  if (!doctor) return null

  const { totalSlots, bookedSlots, occupancy } = weeklyTotals(sessions)
  const nextAvailable = getNextAvailableSession(sessions)

  const updateSession = (key, field, value) => {
    setSessions((prev) =>
      prev.map((s) =>
        s._key === key
          ? { ...s, [field]: field === 'totalSlots' || field === 'bookedSlots' ? Number(value) || 0 : value }
          : s
      )
    )
  }

  const removeSession = (key) => setSessions((prev) => prev.filter((s) => s._key !== key))

  const addSession = () =>
    setSessions((prev) => [
      ...prev,
      { day: 'Monday', start: '9:00 AM', end: '12:00 PM', totalSlots: 10, bookedSlots: 0, _key: `new_${Date.now()}_${Math.random()}` },
    ])

  const handleSave = () => {
    const clean = sessions.map(({ _key, ...rest }) => rest)
    onSave(doctor._id || doctor.id, clean)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{doctor.name}</p>
            <p className="text-xs text-gray-400">
              {doctor.specialty}
              {doctor.qualification ? ` · ${doctor.qualification}` : ''} · Weekly slots
            </p>
            {(doctor.phone || doctor.fee != null) && (
              <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                {doctor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {doctor.phone}
                  </span>
                )}
                {doctor.fee != null && (
                  <span className="flex items-center gap-1">
                    <IndianRupee size={11} /> {doctor.fee} / visit
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Weekly Capacity</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{totalSlots} slots</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Booked / Occupancy</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {bookedSlots} · {occupancy}%
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Next Available</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {nextAvailable ? `${nextAvailable.day.slice(0, 3)}, ${nextAvailable.start}` : 'Fully booked'}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">
              No weekly sessions set yet. Add one below to start building this doctor's schedule.
            </p>
          ) : (
            sessions.map((s) => {
              const full = (s.bookedSlots || 0) >= (s.totalSlots || 0)
              const pct = s.totalSlots ? Math.min(100, Math.round(((s.bookedSlots || 0) / s.totalSlots) * 100)) : 0
              return (
                <div key={s._key} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={s.day}
                      onChange={(e) => updateSession(s._key, 'day', e.target.value)}
                      className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    >
                      {WEEKDAY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                    </div>
                    <input
                      value={s.start}
                      onChange={(e) => updateSession(s._key, 'start', e.target.value)}
                      placeholder="Start (e.g. 9:00 AM)"
                      className="h-8 w-28 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    />
                    <span className="text-xs text-gray-400">–</span>
                    <input
                      value={s.end}
                      onChange={(e) => updateSession(s._key, 'end', e.target.value)}
                      placeholder="End (e.g. 12:00 PM)"
                      className="h-8 w-28 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    />
                    <div className="flex items-center gap-1 ml-auto">
                      <label className="text-[10px] text-gray-400">Slots</label>
                      <input
                        type="number"
                        min={0}
                        value={s.totalSlots}
                        onChange={(e) => updateSession(s._key, 'totalSlots', e.target.value)}
                        className="h-8 w-16 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      onClick={() => removeSession(s._key)}
                      title="Remove session"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${full ? 'bg-red-400' : 'bg-brand-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${full ? 'text-red-500' : 'text-gray-400'}`}>
                      {s.bookedSlots || 0}/{s.totalSlots || 0} booked today
                    </span>
                  </div>
                </div>
              )
            })
          )}

          <button
            onClick={addSession}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={14} />
            Add Session
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Save Schedule
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ClinicDoctors() {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | leave
  const [reportDoctorId, setReportDoctorId] = useState(null)
  const [slotsDoctorId, setSlotsDoctorId] = useState(null)
  const [formModal, setFormModal] = useState(null) // { mode: 'add' | 'edit', doctor?: Doctor }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [doctorsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/clinic/doctors'),
        api.get('/clinic/appointments'),
      ])

      if (doctorsRes.status === 'fulfilled') {
        setDoctors(doctorsRes.value.data.doctors || doctorsRes.value.data || [])
      } else {
        toast.error('Failed to load doctors')
      }

      if (appointmentsRes.status === 'fulfilled') {
        const apptsList = appointmentsRes.value.data.appointments || appointmentsRes.value.data || []
        const grouped = apptsList.reduce((acc, appt) => {
          const docId = appt.doctorId || appt.doctor?._id || appt.doctor
          if (docId) {
            acc[docId] = acc[docId] || []
            acc[docId].push(appt)
          }
          return acc
        }, {})
        setAppointments(grouped)
      }
    } catch (error) {
      console.error('Failed to load clinic data:', error)
      toast.error(error.message || 'Error loading clinic data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addDoctor = async (values) => {
    try {
      const response = await api.post('/clinic/doctors', values)
      const doctor = response.data.doctor || response.data
      setDoctors((prev) => [doctor, ...prev])
      toast.success('Doctor added successfully')
    } catch (error) {
      console.error('Add doctor error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to add doctor')
    }
  }

  const editDoctor = async (id, values) => {
    try {
      const response = await api.patch(`/clinic/doctors/${id}`, values)
      const updatedDoctor = response.data.doctor || response.data
      setDoctors((prev) =>
        prev.map((d) => ((d._id || d.id) === id ? updatedDoctor : d))
      )
      toast.success('Doctor updated successfully')
    } catch (error) {
      console.error('Update doctor error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update doctor')
    }
  }

  const removeDoctor = async (id) => {
    const confirmed = window.confirm('Are you sure you want to remove this doctor?')
    if (!confirmed) return

    try {
      await api.delete(`/clinic/doctors/${id}`)
      setDoctors((prev) => prev.filter((d) => (d._id || d.id) !== id))
      setAppointments((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      if (reportDoctorId === id) setReportDoctorId(null)
      if (slotsDoctorId === id) setSlotsDoctorId(null)
      toast.success('Doctor removed successfully')
    } catch (error) {
      console.error('Delete doctor error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to remove doctor')
    }
  }

  const toggleActive = async (id) => {
    const doctor = doctors.find((d) => (d._id || d.id) === id)
    if (!doctor) return

    try {
      const response = await api.patch(`/clinic/doctors/${id}`, {
        active: !doctor.active,
      })
      const updatedDoctor = response.data.doctor || response.data
      setDoctors((prev) =>
        prev.map((d) => ((d._id || d.id) === id ? updatedDoctor : d))
      )
      toast.success(updatedDoctor.active ? 'Doctor marked active' : 'Doctor marked on leave')
    } catch (error) {
      console.error('Toggle doctor status error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update doctor status')
    }
  }

  const updateAvailability = async (id, availability) => {
    try {
      const response = await api.patch(`/clinic/doctors/${id}`, {
        availability,
      })

      const updatedDoctor = response.data.doctor || response.data

      setDoctors((prev) =>
        prev.map((d) => ((d._id || d.id) === id ? updatedDoctor : d))
      )

      toast.success('Schedule saved')
    } catch (error) {
      console.error('Save schedule error:', error)
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Failed to save schedule'
      )
    }
  }

  const filtered = doctors.filter((d) => {
    const q = query.toLowerCase()
    const matchesQuery =
      d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? d.active : !d.active)
    return matchesQuery && matchesStatus
  })

  const todayStatsByDoctor = useMemo(() => {
    const map = {}
    doctors.forEach((d) => {
      const doctorId = d._id || d.id
      const todays = filterAppointments(appointments[doctorId] || [], 'day')
      const { totalPatients, totalAmount } = summarize(todays)
      map[doctorId] = {
        bookedSlots: Math.min(totalPatients, d.totalSlots || 0),
        patientsToday: totalPatients,
        paymentsToday: totalAmount,
      }
    })
    return map
  }, [doctors, appointments])

  const reportDoctor = doctors.find((d) => (d._id || d.id) === reportDoctorId) || null
  const slotsDoctor = doctors.find((d) => (d._id || d.id) === slotsDoctorId) || null

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctors</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Manage doctors and their weekly availability.
            </p>
          </div>
        ),
        right: (
          <button
            onClick={() => setFormModal({ mode: 'add' })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            Add Doctor
          </button>
        ),
      }}
    >
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Doctors</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Manage doctors &amp; availability.</p>
        </div>
        <button
          onClick={() => setFormModal({ mode: 'add' })}
          className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center"
        >
          <Plus size={17} />
        </button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 shrink-0">
            All Doctors ({filtered.length})
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors..."
                className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent pl-8 pr-3 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading doctors...</div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((doc) => {
                const doctorId = doc._id || doc.id
                const stats = todayStatsByDoctor[doctorId] || {
                  bookedSlots: 0,
                  patientsToday: 0,
                  paymentsToday: 0,
                }
                const available = (doc.totalSlots || 0) - stats.bookedSlots
                const nextAvailable = getNextAvailableSession(doc.availability)

                return (
                  <motion.div
                    key={doctorId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    onClick={() => setSlotsDoctorId(doctorId)}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <Stethoscope size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            doc.active
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {doc.active ? 'Active' : 'On Leave'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {doc.specialty}
                        {doc.qualification ? ` · ${doc.qualification}` : ''}
                      </p>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-0.5 flex items-center gap-1">
                        <CalendarClock size={11} />
                        {nextAvailable
                          ? `Next: ${nextAvailable.day}, ${nextAvailable.start}–${nextAvailable.end}`
                          : (doc.availability || []).length === 0
                          ? 'No schedule set yet'
                          : 'Fully booked this week'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0">
                      <div>
                        <p className="text-gray-400">Today</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {stats.bookedSlots}/{doc.totalSlots || 0}{' '}
                          <span className="text-gray-400 font-normal">({available} open)</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Patients</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {stats.patientsToday}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payments</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {currency(stats.paymentsToday)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setFormModal({ mode: 'edit', doctor: doc })}
                        title="Edit doctor"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setReportDoctorId(doctorId)}
                        title="View report"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <BarChart3 size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(doctorId)}
                        title={doc.active ? 'Mark on leave' : 'Mark active'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                          doc.active
                            ? 'border-green-200 text-green-600 dark:border-green-800'
                            : 'border-gray-200 text-gray-400 dark:border-gray-700'
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => removeDoctor(doctorId)}
                        title="Remove doctor"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 dark:text-gray-600 hidden sm:block"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-6">No doctors match your search.</p>
            )}
          </div>
        )}
      </div>

      {formModal && (
        <DoctorFormModal
          key={formModal.doctor?._id || formModal.doctor?.id || 'new'}
          mode={formModal.mode}
          initial={formModal.doctor}
          onClose={() => setFormModal(null)}
          onSubmit={(values) =>
            formModal.mode === 'edit'
              ? editDoctor(formModal.doctor._id || formModal.doctor.id, values)
              : addDoctor(values)
          }
        />
      )}

      {slotsDoctor && (
        <DoctorSlotsDrawer
          key={slotsDoctor._id || slotsDoctor.id}
          doctor={slotsDoctor}
          onClose={() => setSlotsDoctorId(null)}
          onSave={updateAvailability}
        />
      )}

      {reportDoctor && (
        <DoctorReportDrawer
          doctor={reportDoctor}
          records={appointments[reportDoctor._id || reportDoctor.id] || []}
          onClose={() => setReportDoctorId(null)}
        />
      )}
    </ClinicDashboardLayout>
  )
}