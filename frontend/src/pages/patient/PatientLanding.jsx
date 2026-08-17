import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CalendarCheck2,
  FileText,
  Activity,
  Stethoscope,
  Building2,
  Star,
  MapPin,
  Users,
  ArrowRight,
  HeartHandshake,
  ChevronRight,
  CalendarDays,
  UserCheck2,
} from 'lucide-react'
import BottomTabBar from '../../components/layout/BottomTabBar.jsx'
import { mockClinics, mockDoctorsByClinic } from '../../services/mockData.js'

const howItWorks = [
  { icon: CalendarCheck2, label: 'Book' },
  { icon: FileText, label: 'Receive PID' },
  { icon: Activity, label: 'Track Queue' },
  { icon: Stethoscope, label: 'Consult' },
]

function buildSearchIndex() {
  return mockClinics.map((clinic) => ({
    ...clinic,
    doctors: mockDoctorsByClinic[clinic._id]?.doctors || [],
  }))
}

export default function PatientLanding() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [lastAppointment, setLastAppointment] = useState(null)

  const searchIndex = useMemo(buildSearchIndex, [])

  // Check for stored active appointment on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lastAppointment')
      if (stored) {
        setLastAppointment(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to parse lastAppointment from localStorage', e)
    }
  }, [])

  const results = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return null

    return searchIndex
      .map((clinic) => {
        const clinicMatches = clinic.name.toLowerCase().includes(query)
        const matchedDoctor = clinic.doctors.find((d) =>
          d.name.toLowerCase().includes(query)
        )
        if (!clinicMatches && !matchedDoctor) return null
        return {
          ...clinic,
          matchReason: matchedDoctor
            ? `${matchedDoctor.name} available here`
            : null,
        }
      })
      .filter(Boolean)
  }, [search, searchIndex])

  const popularClinics = searchIndex.slice(0, 3)
  const listToShow = results !== null ? results : popularClinics

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-purple-50/30 dark:from-gray-950 dark:via-surface-dark dark:to-surface-dark sm:items-center sm:py-10">
      <div className="relative w-full sm:max-w-md md:max-w-lg flex flex-col h-screen h-[100dvh] sm:h-[48rem] sm:max-h-[48rem] bg-slate-50/60 dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800">

        {/* Header with Qno Branding and Clinic Portal Button */}
        <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:pt-6 pb-2 shrink-0 bg-transparent z-10">
          <h2 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
            Qno
          </h2>

          <button
            onClick={() => navigate('/clinic-login')}
            aria-label="Clinic Entry Portal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-100/60 dark:bg-gray-800 dark:text-purple-300 hover:bg-purple-200/60 transition-colors"
          >
            <Building2 size={15} />
            <span>Clinic Portal</span>
          </button>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:pb-24">

          {/* Top Banner Section: Quran Verse & Quote */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative pt-2 pb-5"
          >
            {/* Arabic Text */}
            <div className="text-center flex flex-col items-center">
              <p className="font-serif text-3xl text-purple-900 dark:text-purple-300 leading-snug tracking-wide" dir="rtl">
                وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ
              </p>
              <div className="w-12 h-[1px] bg-purple-300 dark:bg-purple-800 my-2.5" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                And when I am ill,<br />
                <span className="text-purple-700 dark:text-purple-400">it is He who cures me.</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2">
                — Quran 26:80
              </p>
            </div>



          </motion.div>

          {/* Main Controls Card */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-4 shadow-sm border border-purple-50/50 dark:border-gray-700/60 mb-6 space-y-3">

            {/* Search Input */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                inputMode="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clinics, doctors, specialties..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50/70 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-700 focus:border-purple-600 focus:outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {!search && (
              <>
                {/* Book an Appointment Primary Button */}
                <button
                  onClick={() => navigate('/clinics')}
                  className="w-full h-12 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-sm"
                >
                  <CalendarDays size={18} />
                  Book an Appointment
                </button>

                {/* Continue Last Appointment (if available) */}
                {lastAppointment && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-purple-900 text-white p-3.5 shadow-soft"
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                      Continue Last Appointment
                    </p>
                    <h3 className="font-bold text-sm mt-0.5 truncate">
                      {lastAppointment.clinicName || 'Clinic'}
                    </h3>
                    <p className="text-xs opacity-90 truncate">
                      {lastAppointment.doctorName || 'Doctor'}
                    </p>
                    <button
                      onClick={() =>
                        navigate(
                          `/queue/${lastAppointment.patientId || localStorage.getItem('lastPatientId')}`
                        )
                      }
                      className="mt-2.5 w-full h-8 rounded-xl bg-white text-purple-900 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                    >
                      Continue <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}

                {/* Already have a Patient ID? Card */}
                <div
                  onClick={() => navigate('/patient-home')}
                  className="rounded-2xl bg-purple-50/50 dark:bg-gray-900/50 border border-purple-100/60 dark:border-gray-700 p-3.5 flex items-center justify-between cursor-pointer group hover:bg-purple-100/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/80 dark:bg-gray-800 flex items-center justify-center text-purple-700 shrink-0">
                      <UserCheck2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        Already have a Patient ID?
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        Join your queue instantly using the Patient ID shared with you.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                </div>

                {/* Secondary Button: Join Queue with Patient ID */}
                <button
                  onClick={() => navigate('/patient-home')}
                  className="w-full h-11 rounded-2xl border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-gray-800 font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <CalendarDays size={18} />
                  Join Queue with Patient ID
                </button>
              </>
            )}
          </div>

          {/* How It Works Section */}
          {!search && (
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-transparent p-4 mb-6 shadow-sm">
              <p className="text-xs font-bold mb-3 text-slate-800 dark:text-white uppercase tracking-wider">
                How it works
              </p>
              <div className="grid grid-cols-4 gap-2">
                {howItWorks.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-gray-900 border border-purple-100/60 dark:border-gray-700 flex items-center justify-center text-purple-700 dark:text-purple-400">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Clinics / Search Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {results !== null ? 'Search Results' : 'Popular Clinics'}
              </p>
              {results === null && (
                <button
                  onClick={() => navigate('/clinics')}
                  className="text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline"
                >
                  View all
                </button>
              )}
            </div>

            {listToShow.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                No clinics or doctors found for "{search}".
              </p>
            )}

            <div className="space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {listToShow.map((clinic) => (
                  <motion.button
                    key={clinic._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/clinic/${clinic._id}`)}
                    className="w-full text-left rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm active:bg-slate-50 dark:active:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
                        {clinic.image ? (
                          <img
                            src={clinic.image}
                            alt={clinic.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2
                            size={22}
                            className="text-purple-700 dark:text-purple-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate text-slate-800 dark:text-white">
                          {clinic.name}
                        </p>

                        <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Star
                              size={12}
                              className="text-amber-400 fill-amber-400"
                            />
                            {clinic.rating ?? '4.8'}
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {clinic.distanceKm ?? '2.3'} km
                          </span>

                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-slate-400" />
                            {clinic.doctors?.length ?? 8} Doctors
                          </span>
                        </div>

                        {clinic.matchReason && (
                          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1 truncate">
                            {clinic.matchReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Developer Credit Footer */}
          <div className="mt-8 mb-2 text-center">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Built with the intention of helping people.
              <br></br>
              <button
                onClick={() => navigate('/about-developer')}

                className="font-semibold text-purple-700 dark:text-purple-400 hover:underline transition-all"
              >
                Meet the Developer
              </button>
            </p>
          </div>

        </main>

        <BottomTabBar />
      </div>
    </div>
  )
}