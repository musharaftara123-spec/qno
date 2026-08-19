import React, { useMemo, useState } from 'react'
import {
  Search,
  Printer,
  Globe,
  UserCog,
  IndianRupee,
  Timer,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import PatientQuickActions from '../../components/clinic/PatientQuickActions.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'
import { mockDoctorsByClinic, getAppointmentsForClinic } from '../../services/mockData.js'

export default function Patients() {
  const { user } = useClinicAuth()
  const clinicId = user?.clinicId || 'clinic_1'
  const doctors = mockDoctorsByClinic[clinicId]?.doctors || []

  const allAppointments = useMemo(() => getAppointmentsForClinic(clinicId), [clinicId])

  const [search, setSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ]

  const isInPeriod = (timestamp, period) => {
    if (period === 'all') return true
    if (!timestamp) return false
    const date = new Date(timestamp)
    const now = new Date()

    if (period === 'day') {
      return date.toDateString() === now.toDateString()
    }

    if (period === 'week') {
      // Week starts on Monday
      const startOfWeek = new Date(now)
      const day = (now.getDay() + 6) % 7 // 0 = Monday ... 6 = Sunday
      startOfWeek.setDate(now.getDate() - day)
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      return date >= startOfWeek && date < endOfWeek
    }

    if (period === 'month') {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      )
    }

    if (period === 'year') {
      return date.getFullYear() === now.getFullYear()
    }

    return true
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return allAppointments.filter((a) => {
      if (doctorFilter !== 'all' && a.doctorId !== doctorFilter) return false
      if (sourceFilter !== 'all' && a.bookedBy !== sourceFilter) return false
      if (!isInPeriod(a.createdAt, periodFilter)) return false
      if (query) {
        const haystack = `${a.patientName} ${a.patientPhone} ${a.patientId} ${a.appointmentDate}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [allAppointments, doctorFilter, sourceFilter, periodFilter, search])

  const totals = useMemo(() => {
    const totalFees = filtered.reduce((sum, a) => sum + (a.fee || 0), 0)

    // Average waiting time = sum of each patient's recorded wait (minutes)
    // divided by the number of patients that have a wait time recorded.
    // Only counts records with a real waitTimeMinutes value, so it isn't
    // skewed by legacy/incomplete records.
    const withWaitTime = filtered.filter((a) => typeof a.waitTimeMinutes === 'number')
    const totalWaitMinutes = withWaitTime.reduce((sum, a) => sum + a.waitTimeMinutes, 0)
    const avgWaitMinutes = withWaitTime.length
      ? Math.round(totalWaitMinutes / withWaitTime.length)
      : 0

    return { totalFees, avgWaitMinutes, count: filtered.length }
  }, [filtered])

  const formatWaitTime = (minutes) => {
    if (!minutes) return '0 min'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs === 0) return `${mins} min`
    return `${hrs}h ${mins}m`
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Patients</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              All appointment records for your clinic.
            </p>
          </div>
        ),
        right: (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors print:hidden"
          >
            <Printer size={15} />
            Export PDF
          </button>
        ),
      }}
    >
      <div className="lg:hidden flex items-center justify-between mb-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All appointment records for your clinic.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-medium"
        >
          <Printer size={14} />
          PDF
        </button>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">Patient Records</h1>
        <p className="text-sm text-gray-500">
          Generated {new Date().toLocaleDateString()} ·{' '}
          {doctorFilter === 'all' ? 'All Doctors' : doctors.find((d) => d._id === doctorFilter)?.name} ·{' '}
          {periodOptions.find((p) => p.value === periodFilter)?.label}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, Patient ID, date..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
        >
          <option value="all">All Doctors</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
        >
          <option value="all">Online + Receptionist</option>
          <option value="online">Online Only</option>
          <option value="receptionist">Receptionist Only</option>
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
        >
          {periodOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4">
          <p className="text-xs text-gray-400 mb-1">Total Patients</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totals.count}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <IndianRupee size={12} /> Total Fees Collected
          </p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            ₹{totals.totalFees}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Timer size={12} /> Avg. Waiting Time
          </p>
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
            {formatWaitTime(totals.avgWaitMinutes)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No records match these filters.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                <th className="font-medium py-2 pr-3">Patient ID</th>
                <th className="font-medium py-2 pr-3">Name</th>
                <th className="font-medium py-2 pr-3">Doctor</th>
                <th className="font-medium py-2 pr-3">Date</th>
                <th className="font-medium py-2 pr-3">Source</th>
                <th className="font-medium py-2 pr-3 text-right">Fee</th>
                <th className="font-medium py-2 pr-3 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.appointmentId} className="border-t border-gray-50 dark:border-gray-800">
                  <td className="py-2.5 pr-3 font-medium text-brand-600 dark:text-brand-400 whitespace-nowrap">
                    {a.patientId}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {a.patientName}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {a.doctorName}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {a.appointmentDate}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        a.bookedBy === 'online'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {a.bookedBy === 'online' ? <Globe size={11} /> : <UserCog size={11} />}
                      {a.bookedBy === 'online' ? 'Online' : 'Receptionist'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-medium text-gray-800 dark:text-gray-200">
                    ₹{a.fee}
                  </td>
                  <td className="py-2.5 pr-3 text-right print:hidden">
                    <div className="flex justify-end">
                      <PatientQuickActions
                        clinicId={clinicId}
                        patientName={a.patientName}
                        patientPhone={a.patientPhone}
                        patientAge={a.patientAge}
                        patientGender={a.patientGender}
                        doctorName={a.doctorName}
                        doctorQualification={doctors.find((d) => d._id === a.doctorId)?.qualification}
                        appointmentDate={a.appointmentDate}
                        size="xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClinicDashboardLayout>
  )
}