import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Copy, CopyCheck } from 'lucide-react'
import { lookupAppointmentByAppointmentId, markAppointmentPaid } from '../../services/mockData.js'

const confettiDots = [
  { top: '5%', left: '15%', color: 'bg-red-400', size: 'w-2 h-2', rotate: '20deg' },
  { top: '0%', left: '75%', color: 'bg-blue-400', size: 'w-2 h-2', rotate: '-15deg' },
  { top: '20%', left: '5%', color: 'bg-amber-400', size: 'w-1.5 h-1.5', rotate: '0deg' },
  { top: '15%', left: '90%', color: 'bg-green-400', size: 'w-1.5 h-1.5', rotate: '10deg' },
  { top: '35%', left: '85%', color: 'bg-purple-400', size: 'w-2 h-2', rotate: '30deg' },
  { top: '38%', left: '10%', color: 'bg-pink-400', size: 'w-2 h-2', rotate: '-10deg' },
]

export default function PaymentSuccess() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const appointment = useMemo(() => {
    if (!appointmentId) return null
    markAppointmentPaid(appointmentId)
    return lookupAppointmentByAppointmentId(appointmentId)
  }, [appointmentId])

  const patientId = appointment?.patientId

  const handleCopy = async () => {
    if (!patientId) return
    try {
      await navigator.clipboard.writeText(`${patientId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable — fail silently, non-critical
    }
  }

  if (!appointment) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-surface-dark px-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          We couldn't find this appointment. Please check the link or book again.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-50 dark:bg-surface-dark sm:items-center sm:py-10">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] bg-white dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800">
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-6 text-center">
          <div className="relative w-28 h-28 mb-6">
            {confettiDots.map((dot, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                className={`absolute rounded-sm ${dot.color} ${dot.size}`}
                style={{ top: dot.top, left: dot.left, rotate: dot.rotate }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check size={44} className="text-white" strokeWidth={3} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-xl font-bold">Payment Successful!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
              Your appointment is confirmed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 overflow-hidden mb-6"
          >
            <div className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Patient ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 tracking-wide">
                  {patientId}
                </span>
                <button
                  onClick={handleCopy}
                  aria-label="Copy Patient ID"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0"
                >
                  {copied ? (
                    <CopyCheck size={15} className="text-green-500" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please use this ID to join the queue at the clinic.
              </p>
            </div>
          </motion.div>

          <div className="w-full space-y-3">
            <button
              onClick={() => navigate(`/appointment/${appointmentId}/queue`)}
              className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold active:scale-[0.98] transition-transform"
            >
              Go to Queue
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 underline underline-offset-2"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}