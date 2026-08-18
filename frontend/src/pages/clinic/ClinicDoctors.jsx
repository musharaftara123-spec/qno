import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  Users,
  CalendarCheck2,
  Wallet,
  Plus,
  Trash2,
  X,
  Power,
  Search,
  FileDown,
  BarChart3,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import {
  mockClinicInfo,
  mockDoctors,
  mockDoctorAppointments,
} from '../../services/clinicMockData.js'
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
  doc.text(`${mockClinicInfo?.name || 'Clinic'} - ${doctor.name}`, 14, 16)
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

  autoTable(doc, {
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

function AddDoctorModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', specialty: '', totalSlots: 15 })
  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.specialty.trim()) return
    onAdd({
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      totalSlots: Number(form.totalSlots) || 1,
    })
    setForm({ name: '', specialty: '', totalSlots: 15 })
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
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Add Doctor</p>
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

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Add Doctor
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
                  <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/60">
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

export default function ClinicDoctors() {
  const [doctors, setDoctors] = useState(mockDoctors)
  const [appointments, setAppointments] = useState(mockDoctorAppointments)
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [reportDoctorId, setReportDoctorId] = useState(null)

  const addDoctor = (doc) => {
    const id = `doc_${Date.now()}`
    setDoctors((prev) => [{ id, active: true, ...doc }, ...prev])
    setAppointments((prev) => ({ ...prev, [id]: [] }))
  }

  const removeDoctor = (id) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id))
    setAppointments((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (reportDoctorId === id) setReportDoctorId(null)
  }

  const toggleActive = (id) =>
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)))

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query.toLowerCase())
  )

  const todayStatsByDoctor = useMemo(() => {
    const map = {}
    doctors.forEach((d) => {
      const todays = filterAppointments(appointments[d.id] || [], 'day')
      const { totalPatients, totalAmount } = summarize(todays)
      map[d.id] = {
        bookedSlots: Math.min(totalPatients, d.totalSlots),
        patientsToday: totalPatients,
        paymentsToday: totalAmount,
      }
    })
    return map
  }, [doctors, appointments])

  const totals = doctors.reduce(
    (acc, d) => {
      const stats = todayStatsByDoctor[d.id] || { bookedSlots: 0, patientsToday: 0, paymentsToday: 0 }
      acc.totalSlots += d.totalSlots
      acc.bookedSlots += stats.bookedSlots
      acc.patients += stats.patientsToday
      acc.payments += stats.paymentsToday
      return acc
    },
    { totalSlots: 0, bookedSlots: 0, patients: 0, payments: 0 }
  )

  const summaryCards = [
    {
      key: 'doctors',
      label: 'Total Doctors',
      value: doctors.length,
      sub: `${doctors.filter((d) => d.active).length} active`,
      icon: Stethoscope,
      tone: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      key: 'slots',
      label: "Today's Slots",
      value: `${totals.bookedSlots}/${totals.totalSlots}`,
      sub: 'Booked / Total',
      icon: CalendarCheck2,
      tone: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    },
    {
      key: 'patients',
      label: "Today's Patients",
      value: totals.patients,
      sub: 'Across all doctors',
      icon: Users,
      tone: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      key: 'payments',
      label: "Today's Payments",
      value: currency(totals.payments),
      sub: 'Collected',
      icon: Wallet,
      tone: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
  ]

  const reportDoctor = doctors.find((d) => d.id === reportDoctorId) || null

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctors</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Manage doctors, availability and today's activity.
            </p>
          </div>
        ),
        right: (
          <button
            onClick={() => setModalOpen(true)}
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
          onClick={() => setModalOpen(true)}
          className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center"
        >
          <Plus size={17} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {summaryCards.map((card) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.tone}`}>
              <card.icon size={17} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{card.value}</p>
            <p className="text-[11px] font-medium mt-1.5 text-gray-400">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 shrink-0">
            All Doctors ({filtered.length})
          </p>
          <div className="relative w-full max-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors..."
              className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent pl-8 pr-3 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((doc) => {
              const stats = todayStatsByDoctor[doc.id] || {
                bookedSlots: 0,
                patientsToday: 0,
                paymentsToday: 0,
              }
              const available = doc.totalSlots - stats.bookedSlots
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3"
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
                    <p className="text-xs text-gray-400 truncate">{doc.specialty}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0">
                    <div>
                      <p className="text-gray-400">Slots</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {stats.bookedSlots}/{doc.totalSlots}{' '}
                        <span className="text-gray-400 font-normal">({available} open)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Patients</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{stats.patientsToday}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Payments</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {currency(stats.paymentsToday)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReportDoctorId(doc.id)}
                      title="View report"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <BarChart3 size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive(doc.id)}
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
                      onClick={() => removeDoctor(doc.id)}
                      title="Remove doctor"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-6">No doctors match your search.</p>
          )}
        </div>
      </div>

      <AddDoctorModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addDoctor} />
      {reportDoctor && (
        <DoctorReportDrawer
          doctor={reportDoctor}
          records={appointments[reportDoctor.id] || []}
          onClose={() => setReportDoctorId(null)}
        />
      )}
    </ClinicDashboardLayout>
  )
}