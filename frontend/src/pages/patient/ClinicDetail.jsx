import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Heart,
  Star,
  MapPin,
  Clock3,
  IndianRupee,
  Building2,
  CreditCard,
  Sofa,
  ParkingCircle,
  Pill,
  ListChecks,
} from 'lucide-react'
import { mockClinics } from '../../services/mockData.js'

const FACILITY_ICONS = {
  'Digital Queue': ListChecks,
  'Online Payment': CreditCard,
  'Waiting Lounge': Sofa,
  Parking: ParkingCircle,
  Pharmacy: Pill,
}

export default function ClinicDetail() {
  const { clinicId } = useParams()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const clinic = mockClinics.find((c) => c._id === clinicId)

  if (!clinic) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-surface-dark px-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Clinic not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-50 dark:bg-surface-dark sm:items-center sm:py-10">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] bg-white dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4 pb-2 shrink-0 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-soft flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="font-semibold text-sm truncate max-w-[55%]">{clinic.name}</p>
          <button
            onClick={() => setSaved((s) => !s)}
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-soft flex items-center justify-center"
            aria-label="Save clinic"
          >
            <Heart
              size={18}
              className={saved ? 'text-red-500 fill-red-500' : 'text-gray-400'}
            />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-6">
          {/* Banner */}
          <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <Building2 size={40} className="text-brand-500 dark:text-brand-400" />
            <span
              className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${
                clinic.isOpen
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              {clinic.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          <div className="px-5 space-y-5">
            {/* Name, category, rating */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-xl font-bold">{clinic.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{clinic.category}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{clinic.rating}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ({clinic.reviewCount} reviews)
                </span>
              </div>
            </motion.div>

            {/* Distance / Timings / Fee */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                <MapPin size={16} className="mx-auto mb-1 text-brand-600 dark:text-brand-400" />
                <p className="text-sm font-semibold">{clinic.distanceKm} km</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Distance</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                <Clock3 size={16} className="mx-auto mb-1 text-brand-600 dark:text-brand-400" />
                <p className="text-[11px] font-semibold leading-tight">{clinic.timings}</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                <IndianRupee
                  size={16}
                  className="mx-auto mb-1 text-brand-600 dark:text-brand-400"
                />
                <p className="text-sm font-semibold">₹{clinic.consultationFee}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Consultation Fee</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
              <span>{clinic.address}</span>
            </div>

            {/* Facilities */}
            <div>
              <p className="text-sm font-semibold mb-3">Facilities</p>
              <div className="grid grid-cols-4 gap-2">
                {clinic.facilities.map((facility) => {
                  const Icon = FACILITY_ICONS[facility] || ListChecks
                  return (
                    <div
                      key={facility}
                      className="flex flex-col items-center text-center gap-1.5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-gray-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                        {facility}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* About */}
            <div>
              <p className="text-sm font-semibold mb-2">About Clinic</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {clinic.about}
              </p>
            </div>
          </div>
        </main>

        {/* Sticky CTA */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <button
            onClick={() => navigate(`/clinic/${clinic._id}/doctors`)}
            className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold active:scale-[0.98] transition-transform"
          >
            Select Doctor
          </button>
        </div>
      </div>
    </div>
  )
}