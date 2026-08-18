import React, { useMemo, useState } from 'react'
import {
  Search,
  Printer,
  Globe,
  UserCog,
  IndianRupee,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
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
  const [yearFilter, setYearFilter] = useState('all')

  const availableYears = useMemo(() => {
    const years = new Set(
      allAppointments.map((a) => new Date(a.createdAt).getFullYear())
    )
    return Array.from(years).sort((a, b) => b - a)
  }, [allAppointments])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return allAppointments.filter((a) => {
      if (doctorFilter !== 'all' && a.doctorId !== doctorFilter) return false
      if (sourceFilter !== 'all' && a.bookedBy !== sourceFilter) return false
      if (
        yearFilter !== 'all' &&
        new Date(a.createdAt).getFullYear() !== Number(yearFilter)
      )
        return false
      if (query) {
        const haystack = `${a.patientName} ${a.patientPhone} ${a.patientId}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [allAppointments, doctorFilter, sourceFilter, yearFilter, search])

  const totals = useMemo(() => {
    const totalFees = filtered.reduce((sum, a) => sum + (a.fee || 0), 0)
    const byDoctor = {}
    filtered.forEach((a) => {
      const key = a.doctorName || 'Unknown'
      byDoctor[key] = (byDoctor[key] || 0) + (a.fee || 0)
    })
    return { totalFees, byDoctor, count: filtered.length }
  }, [filtered])

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
          {yearFilter === 'all' ? 'All Years' : yearFilter}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, Patient ID..."
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
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
        >
          <option value="all">All Years</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4">
          <p className="text-xs text-gray-400 mb-1">Records Shown</p>
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
        {Object.entries(totals.byDoctor)
          .slice(0, 2)
          .map(([doctor, fee]) => (
            <div
              key={doctor}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4"
            >
              <p className="text-xs text-gray-400 mb-1 truncate">{doctor}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹{fee}</p>
            </div>
          ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No records match these filters.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                <th className="font-medium py-2 pr-3">Patient ID</th>
                <th className="font-medium py-2 pr-3">Name</th>
                <th className="font-medium py-2 pr-3">Doctor</th>
                <th className="font-medium py-2 pr-3">Date</th>
                <th className="font-medium py-2 pr-3">Source</th>
                <th className="font-medium py-2 pr-3 text-right">Fee</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClinicDashboardLayout>
  )
}