import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Search,
  Building2,
  Star,
  Clock3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { mockDoctorsByClinic } from '../../services/mockData.js'

export default function ClinicSelect() {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchClinics() {
      try {
        const { data } = await api.get('/clinics')
        if (mounted) setClinics(data)
      } catch (err) {
        toast.error('Could not load clinics. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchClinics()
    return () => {
      mounted = false
    }
  }, [])

  // Build searchable index with associated doctors
  const searchIndex = clinics.map((clinic) => ({
    ...clinic,
    doctors: mockDoctorsByClinic?.[clinic._id]?.doctors || clinic.doctors || [],
  }))

  // Filter based on clinic name, doctor name, or doctor specialty
  const filtered = searchIndex.filter((clinic) => {
    const query = search.trim().toLowerCase()

    if (!query) return true

    const clinicMatch = clinic.name?.toLowerCase().includes(query)

    const doctorMatch = clinic.doctors.find(
      (doctor) =>
        doctor.name?.toLowerCase().includes(query) ||
        doctor.specialty?.toLowerCase().includes(query)
    )

    clinic.matchReason = doctorMatch
      ? `${doctorMatch.name} • ${doctorMatch.specialty}`
      : null

    return clinicMatch || doctorMatch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-white dark:from-gray-950 dark:via-surface-dark dark:to-surface-dark flex justify-center">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col">
        <header className="flex items-center gap-3 px-5 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Choose Your Clinic</h1>
            <p className="text-sm text-gray-500">Search and select a clinic</p>
          </div>
        </header>

        <main className="px-5 pb-5">
          <div className="relative mb-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search clinics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 focus:border-brand-500 focus:outline-none shadow-soft"
            />
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-3 shadow-soft animate-pulse h-24"
                />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Building2 size={46} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold">No clinics found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try another clinic name.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((clinic) => (
              <motion.button
                key={clinic._id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/clinic/${clinic._id}`)}
                className="w-full text-left rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-soft dark:shadow-softDark active:bg-gray-50 dark:active:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {clinic.image ? (
                      <img
                        src={clinic.image}
                        alt={clinic.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                        <Building2 size={24} className="text-brand-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{clinic.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {clinic.address || 'Address unavailable'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-xs">
                        <Star
                          size={13}
                          className="text-amber-400 fill-amber-400"
                        />
                        <span className="font-medium">
                          {clinic.rating ?? '4.8'}
                        </span>
                        <span className="text-gray-400">
                          ({clinic.reviewCount ?? '120'})
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock3 size={13} />
                        {clinic.distanceKm ?? '2.3'} km
                      </span>
                    </div>

                    {clinic.matchReason ? (
                      <p className="text-xs text-brand-600 mt-2 truncate">
                        👨‍⚕️ {clinic.matchReason}
                      </p>
                    ) : (
                      <p className="text-xs text-brand-600 mt-2">
                        👨‍⚕️ {clinic.doctors?.length ?? 0} Doctors
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}