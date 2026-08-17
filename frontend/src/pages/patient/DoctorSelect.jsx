import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Star, Check, IndianRupee, Calendar, Clock, Users, X } from 'lucide-react'
import { mockDoctorsByClinic } from '../../services/mockData.js'

export default function DoctorSelect() {
  const { clinicId } = useParams()
  const navigate = useNavigate()

  const clinicData = mockDoctorsByClinic[clinicId]
  const doctors = clinicData?.doctors || []

  const [selectedId, setSelectedId] = useState(doctors[0]?._id || null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const selectedDoctor = doctors.find((d) => d._id === selectedId)

  const handleContinue = () => {
    if (!selectedId) return

    if (selectedDoctor?.availability?.length > 0) {
      setSelectedSlot(selectedDoctor.availability[0])
    }
    setShowScheduleModal(true)
  }

  const handleModalContinue = () => {
    if (!selectedSlot) return
    setShowScheduleModal(false)

    navigate(`/clinic/${clinicId}/doctor/${selectedId}/book`, {
      state: {
        slot: selectedSlot,
      },
    })
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-50 dark:bg-surface-dark sm:items-center sm:py-10">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] bg-white dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800 relative">
        {/* Header */}
        <header className="flex items-center justify-center relative px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4 pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-semibold text-base text-gray-900 dark:text-white">Select Doctor</h1>
        </header>

        {/* Doctor List */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {doctors.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
              No doctors available at this clinic right now.
            </p>
          )}

          {doctors.map((doctor) => {
            const isSelected = selectedId === doctor._id
            const availableDays = doctor.availability
              ? doctor.availability.map((slot) => slot.day.substring(0, 3)).join(' • ')
              : 'N/A'

            return (
              <motion.button
                key={doctor._id}
                layout
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedId(doctor._id)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  isSelected
                    ? 'bg-brand-50/50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm overflow-hidden">
                    {doctor.name
                      .replace('Dr. ', '')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{doctor.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {doctor.qualification} • {doctor.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{doctor.rating}</span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isSelected
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                    <IndianRupee size={13} />
                    {doctor.fee}
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full">
                    <Calendar size={13} />
                    <span>Available: {availableDays}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </main>

        {/* Sticky Action Footer */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-white dark:bg-gray-900">
          <button
            onClick={handleContinue}
            disabled={!selectedId}
            className="w-full h-12 rounded-2xl bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
        </div>

        {/* Schedule Modal Popup */}
        <AnimatePresence>
          {showScheduleModal && selectedDoctor && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScheduleModal(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs z-40"
              />

              {/* Bottom Sheet Modal */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-3xl border-t border-gray-100 dark:border-gray-800 z-50 max-h-[85%] flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Modal Drag handle & Header */}
                <div className="pt-3 pb-2 px-4 flex flex-col items-center border-b border-gray-100 dark:border-gray-800 shrink-0 relative">
                  <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
                  <div className="flex items-center justify-between w-full px-1">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">Choose Session</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select an available day for {selectedDoctor.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Content / Schedule Slots */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                  {selectedDoctor.availability?.map((slot, index) => {
                    const isSlotSelected = selectedSlot?.day === slot.day && selectedSlot?.start === slot.start

                    return (
                      <motion.div
                        key={slot.day + index}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSlot(slot)}
                        className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                          isSlotSelected
                            ? 'bg-brand-50/60 dark:bg-brand-900/30 border-brand-500 dark:border-brand-600 ring-2 ring-brand-500/20'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={16}
                              className={isSlotSelected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}
                            />
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{slot.day}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSlotSelected
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isSlotSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/80 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-gray-400" />
                            <span>
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                            <Users size={12} />
                            <span>{slot.queueLength} booked</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                  <button
                    onClick={handleModalContinue}
                    disabled={!selectedSlot}
                    className="w-full h-12 rounded-2xl bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold active:scale-[0.98] transition-transform"
                  >
                    Continue to Booking
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}