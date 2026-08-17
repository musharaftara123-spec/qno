import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Bell, ShieldCheck, Clock } from 'lucide-react'
import { mockClinics, mockDoctorsByClinic, lookupAppointmentByPatientId, lookupAppointmentByAppointmentId } from '../../services/mockData.js'
import QueueNotificationOverlay from '../../components/QueueNotificationOverlay.jsx'
import { playMilestoneSound } from '../../utils/sound.js'

const TOTAL_TOKENS = 50
const MILESTONE_THRESHOLDS = [10, 5, 2]
const AVG_MINS_PER_PATIENT = 5

export default function PatientQueueView() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()

  const appointmentData = useMemo(() => {
    if (!appointmentId) return null
    return (
      lookupAppointmentByPatientId(appointmentId) ||
      lookupAppointmentByAppointmentId(appointmentId)
    )
  }, [appointmentId])

  const clinicName = appointmentData?.clinicName || mockClinics[0].name
  const doctorName = appointmentData?.doctorName || mockDoctorsByClinic['clinic_1']?.doctors[0]?.name

  const myToken = appointmentData?.tokenNumber ?? 12
  const [currentToken, setCurrentToken] = useState(appointmentData?.currentToken ?? 1)
  const [overlayStage, setOverlayStage] = useState('info')

  const sessionStartTime = useMemo(() => {
    const start = new Date()
    start.setHours(16, 0, 0, 0)
    return start
  }, [])

  const shownMilestones = useRef(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToken((prev) => {
        if (prev >= myToken) return prev
        return prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [myToken])

  const patientsAhead = Math.max(0, myToken - currentToken - 1)
  const estWaitMinutes = Math.round(patientsAhead * AVG_MINS_PER_PATIENT)

  const estimatedConsultationTime = useMemo(() => {
    const waitMsFromStart = (myToken - 1) * AVG_MINS_PER_PATIENT * 60 * 1000
    const targetDate = new Date(sessionStartTime.getTime() + waitMsFromStart)

    return targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [myToken, sessionStartTime])

  useEffect(() => {
    if (overlayStage === 'info') return

    if (patientsAhead === 0 && !shownMilestones.current.has('turn')) {
      shownMilestones.current.add('turn')
      setOverlayStage('turn')
      playMilestoneSound('turn')
      return
    }

    if (
      MILESTONE_THRESHOLDS.includes(patientsAhead) &&
      !shownMilestones.current.has(patientsAhead)
    ) {
      shownMilestones.current.add(patientsAhead)
      setOverlayStage('near')
      playMilestoneSound(patientsAhead)
    }
  }, [patientsAhead, overlayStage])

  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentToken - 1) / Math.max(1, myToken - 1)) * 100)
  )

  const gridTokens = useMemo(() => {
    const start = currentToken + 1
    const nearby = []
    for (let t = start; t < start + 9 && t <= TOTAL_TOKENS; t++) {
      nearby.push(t)
    }
    const hasGap = nearby.length > 0 && nearby[nearby.length - 1] < TOTAL_TOKENS - 1
    return { nearby, hasGap, last: TOTAL_TOKENS }
  }, [currentToken])

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 sm:items-center sm:py-10">
      <QueueNotificationOverlay
        stage={overlayStage}
        patientsAhead={patientsAhead}
        myToken={myToken}
        onDismiss={() => setOverlayStage(null)}
        onViewQueue={() => setOverlayStage(null)}
      />

      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] overflow-hidden sm:rounded-3xl">
        <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4 pb-4 shrink-0 text-white">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-sm">{clinicName}</p>
            <p className="text-xs text-white/70">{doctorName}</p>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 shadow-soft p-5"
          >
            <div className="grid grid-cols-3 items-center text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                  Current Token
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {currentToken}
                </p>
              </div>
              <div className="border-x border-gray-100 dark:border-gray-800">
                <p className="text-[10px] uppercase tracking-wide text-brand-500 mb-1">
                  Your Token
                </p>
                <p className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                  {myToken}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                  Patients Ahead
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {patientsAhead}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-2">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Est. Consultation
                </p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Clock size={16} className="text-brand-600 dark:text-brand-400" />
                  {estimatedConsultationTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Est. Wait Time
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                  ~{estWaitMinutes} mins
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white dark:bg-gray-900 shadow-soft p-5"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5">
              Queue Progress
            </p>
            <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
              <motion.div
                className="h-full rounded-full bg-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute -top-2.5 w-7 h-7 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-soft"
                animate={{
                  left: `calc(${progressPercent}% - 14px)`,
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                }}
              >
                {currentToken}
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-3">
              <span>1</span>
              <span>{myToken}</span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1">You are here</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-gray-900 shadow-soft p-5"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Live Queue
            </p>
            <div className="grid grid-cols-5 gap-2">
              {gridTokens.nearby.map((t) => (
                <div
                  key={t}
                  className={`h-11 rounded-xl flex items-center justify-center text-sm font-semibold ${
                    t === myToken
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t}
                </div>
              ))}
              {gridTokens.hasGap && (
                <div className="h-11 rounded-xl flex items-center justify-center text-sm font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400">
                  ...
                </div>
              )}
              {gridTokens.nearby.length > 0 &&
                gridTokens.nearby[gridTokens.nearby.length - 1] < TOTAL_TOKENS && (
                  <div className="h-11 rounded-xl flex items-center justify-center text-sm font-semibold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {TOTAL_TOKENS}
                  </div>
                )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3 flex items-center gap-2.5"
          >
            <ShieldCheck size={18} className="text-white/90 shrink-0" />
            <p className="text-xs text-white/90">
              You will be notified when your turn is near.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  )
}