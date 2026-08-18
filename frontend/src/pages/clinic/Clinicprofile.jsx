import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, MapPin, Clock3, IndianRupee, Check } from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'
import { getClinicById, updateClinicProfile, ALL_FACILITY_OPTIONS } from '../../services/mockData.js'

export default function ClinicProfile() {
  const { user } = useClinicAuth()
  const clinicId = user?.clinicId || 'clinic_1'

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const clinic = getClinicById(clinicId)
    if (clinic) setForm(clinic)
  }, [clinicId])

  if (!form) return null

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const toggleFacility = (facility) => {
    setForm((f) => {
      const has = f.facilities.includes(facility)
      return {
        ...f,
        facilities: has
          ? f.facilities.filter((x) => x !== facility)
          : [...f.facilities, facility],
      }
    })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      updateClinicProfile(clinicId, form)
      setSaving(false)
      toast.success('Clinic profile updated — visible to patients now')
    }, 500)
  }

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clinic Profile</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              These details are shown to patients on your clinic page.
            </p>
          </div>
        ),
      }}
    >
      <div className="lg:hidden mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Clinic Profile</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          These details are shown to patients on your clinic page.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-brand-600 dark:text-brand-400" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Basic Information
            </p>
          </div>

          <Field label="Clinic Name">
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
            />
          </Field>

          <Field label="Category / Type">
            <input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="e.g. General Clinic, Multispecialty Hospital"
              className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
            />
          </Field>

          <Field label="About Clinic">
            <textarea
              value={form.about}
              onChange={(e) => update('about', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm resize-none"
            />
          </Field>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-brand-600 dark:text-brand-400" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Location & Timings
            </p>
          </div>

          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Timings">
              <div className="relative">
                <Clock3 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.timings}
                  onChange={(e) => update('timings', e.target.value)}
                  placeholder="Mon - Sat · 9:00 AM - 8:00 PM"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
                />
              </div>
            </Field>
            <Field label="Consultation Fee">
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={form.consultationFee}
                  onChange={(e) => update('consultationFee', Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-sm"
                />
              </div>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isOpen}
              onChange={(e) => update('isOpen', e.target.checked)}
              className="w-4 h-4 rounded text-brand-600"
            />
            Currently open for appointments
          </label>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Facilities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_FACILITY_OPTIONS.map((facility) => {
              const active = form.facilities.includes(facility)
              return (
                <button
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors text-left ${
                    active
                      ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-300'
                      : 'bg-gray-50 border-transparent text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      active ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {active && <Check size={10} strokeWidth={3} />}
                  </span>
                  {facility}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
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