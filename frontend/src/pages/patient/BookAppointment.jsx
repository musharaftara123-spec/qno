import React, { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import api from '../../services/api.js'

const GENDERS = ['Male', 'Female', 'Other']

export default function BookAppointment() {
  const { clinicId, doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const slot = location.state?.slot

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isValidPhone = /^[0-9]{10}$/.test(phone)
  const isValidAge = age !== '' && Number(age) > 0 && Number(age) < 120
  const canSubmit =
    name.trim().length >= 2 && isValidPhone && isValidAge && gender && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please fill in all required fields correctly.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/appointments', {
        clinicId,
        doctorId,
        patientName: name.trim(),
        patientPhone: phone,
        patientAge: Number(age),
        patientGender: gender,
        purpose: purpose.trim(),
        slotDay: slot?.day,
        slotQueueLength: slot?.queueLength,
      })
      navigate(`/appointment/${data.appointmentId}/payment`)
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-50 dark:bg-surface-dark sm:items-center sm:py-10">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] bg-white dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800">
        {/* Header */}
        <header className="flex items-center justify-center relative px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4 pb-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-semibold text-base">Appointment Details</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Mobile Number</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter mobile number"
              className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Age</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={119}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Gender</label>
            <div className="flex items-center gap-6">
              {GENDERS.map((g) => {
                const isSelected = gender === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-brand-600 border-brand-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{g}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">
              Problem / Purpose of Visit{' '}
              <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe your problem"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent focus:border-brand-500 focus:outline-none text-base resize-none"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-center pt-1">
            <ShieldCheck size={18} className="text-green-500 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your details are secure and will not be shared.
            </p>
          </div>
        </main>

        {/* Sticky CTA */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 rounded-2xl bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Please wait...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}