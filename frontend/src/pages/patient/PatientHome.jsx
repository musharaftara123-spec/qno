import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  UserCheck, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
} from 'lucide-react'
import { lookupAppointmentByPatientId } from '../../services/mockData.js'

export default function PatientHome() {
  const navigate = useNavigate()

  const [patientId, setPatientId] = useState('')
  const [lastPatientId, setLastPatientId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [foundAppointment, setFoundAppointment] = useState(null)

  useEffect(() => {
    const savedId = localStorage.getItem('lastPatientId')
    if (savedId) {
      setLastPatientId(savedId)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/\s+/g, '')
    setPatientId(value)
    if (errorMsg) setErrorMsg('')
  }

  const handleUseLastId = () => {
    if (lastPatientId) {
      setPatientId(lastPatientId)
      setErrorMsg('')
    }
  }

  const handleJoinQueue = (e) => {
    e.preventDefault()
    if (!patientId.trim() || isLoading) return

    setIsLoading(true)
    setErrorMsg('')
    setFoundAppointment(null)

    // Simulates backend API search delay. Replace with a real
    // `await api.get(`/appointments/lookup/${patientId}`)` once the
    // backend exists — lookupAppointmentByPatientId already mirrors
    // that contract (single record, or null).
    setTimeout(() => {
      const match = lookupAppointmentByPatientId(patientId)

      if (match) {
        localStorage.setItem('lastPatientId', patientId)
        setFoundAppointment(match)
        setIsLoading(false)

        setTimeout(() => {
          navigate(`/queue/${match.patientId}`)
        }, 1000)
      } else {
        setIsLoading(false)
        setErrorMsg('Patient ID not found. Please check your Patient ID.')
      }
    }, 1200)
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-50 dark:bg-gray-950 sm:items-center sm:py-8 font-sans">
      <div className="w-full sm:max-w-md flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[44rem] sm:max-h-[48rem] bg-white dark:bg-gray-900 overflow-y-auto sm:rounded-3xl shadow-xl sm:border sm:border-gray-100 dark:sm:border-gray-800">
        
        <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 border-b border-gray-100 dark:border-gray-800/60 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">
            Join Queue
          </h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 px-5 pt-6 pb-8 space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-20 h-20 rounded-full bg-[#6D4CFF]/10 dark:bg-[#6D4CFF]/20 flex items-center justify-center text-[#6D4CFF] dark:text-[#886CFF] shadow-inner"
            >
              <UserCheck size={38} strokeWidth={2.2} />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-1"
            >
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                Track your live appointment queue using your Patient ID.
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                Enter the Patient ID you received after booking your appointment.
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleJoinQueue} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="patientIdInput" 
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider"
              >
                Patient ID
              </label>
              
              <div className="relative">
                <input
                  id="patientIdInput"
                  type="text"
                  value={patientId}
                  onChange={handleInputChange}
                  disabled={isLoading || !!foundAppointment}
                  placeholder="Enter Patient ID"
                  className={`w-full h-14 px-4 text-base font-bold tracking-wide rounded-2xl border transition-all duration-200 outline-none ${
                    errorMsg 
                      ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-[#6D4CFF] focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-[#6D4CFF]/15'
                  }`}
                />
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">
                Example: <span className="font-mono font-medium text-gray-600 dark:text-gray-400">QNO-482731</span>
              </p>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-3.5 flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {foundAppointment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-4 space-y-2 shadow-soft"
                >
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Appointment Found</span>
                  </div>
                  
                  <div className="text-xs space-y-1 text-emerald-950 dark:text-emerald-200 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <p className="flex justify-between">
                      <span className="text-emerald-700/80 dark:text-emerald-400">Clinic:</span>
                      <span className="font-semibold">{foundAppointment.clinicName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-emerald-700/80 dark:text-emerald-400">Doctor:</span>
                      <span className="font-semibold">{foundAppointment.doctorName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-emerald-700/80 dark:text-emerald-400">Your Token:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">#{foundAppointment.tokenNumber}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!patientId.trim() || isLoading || !!foundAppointment}
              className="w-full h-14 rounded-2xl bg-[#6D4CFF] hover:bg-[#5a3ceb] active:bg-[#4d31d4] disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 dark:disabled:text-gray-600 font-bold text-base shadow-lg shadow-[#6D4CFF]/25 disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-white" />
                  <span>Searching appointment...</span>
                </>
              ) : (
                <>
                  <span>Join Queue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 p-4 shadow-soft space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
              <HelpCircle size={16} className="text-[#6D4CFF]" />
              <span>Didn't receive your Patient ID?</span>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pl-6 list-disc">
              <li>Check your WhatsApp confirmation</li>
              <li>Ask the clinic reception</li>
            </ul>
          </div>

          {lastPatientId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUseLastId}
              className="rounded-2xl bg-white dark:bg-gray-800/80 border border-purple-100 dark:border-purple-900/40 p-4 shadow-soft hover:border-[#6D4CFF]/40 cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-[#6D4CFF] shrink-0 group-hover:scale-105 transition-transform">
                <Clock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Continue Previous Queue</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-[#6D4CFF] dark:text-purple-300">
                    {lastPatientId}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  Use the last entered Patient ID on this device.
                </p>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  )
}