import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Users, Check, Smartphone, X } from 'lucide-react'

const confettiDots = [
  { top: '2%', left: '10%', color: 'bg-red-400' },
  { top: '0%', left: '80%', color: 'bg-blue-400' },
  { top: '15%', left: '3%', color: 'bg-amber-400' },
  { top: '10%', left: '92%', color: 'bg-green-400' },
  { top: '25%', left: '88%', color: 'bg-purple-300' },
  { top: '28%', left: '6%', color: 'bg-pink-400' },
]

const MILESTONES = [
  { key: 'ten', label: '10 patients before you' },
  { key: 'five', label: '5 patients before you' },
  { key: 'two', label: '2 patients before you' },
  { key: 'turn', label: 'Your turn' },
]

export default function QueueNotificationOverlay({
  stage,
  patientsAhead,
  myToken,
  onDismiss,
  onViewQueue,
}) {
  return (
    <AnimatePresence>
      {stage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-xs rounded-3xl bg-brand-900 border border-white/10 p-6 text-center text-white relative overflow-hidden"
          >

            {/* Close button only on final notification */}
            {stage === 'turn' && (
              <button
                onClick={onDismiss}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            )}

            {stage === 'info' && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-brand-600/30 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-brand-700/60 flex items-center justify-center">
                    <Bell size={28} className="text-white" />
                  </div>
                </div>

                <h2 className="text-lg font-bold mb-1">
                  You Will Be Notified
                </h2>

                <p className="text-sm text-white/70 mb-5">
                  We will notify you when your turn is near.
                </p>

                <ul className="text-left space-y-2.5 mb-6">
                  {MILESTONES.map((m) => (
                    <li
                      key={m.key}
                      className="flex items-center gap-2 text-sm text-white/85"
                    >
                      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {m.label}
                    </li>
                  ))}
                </ul>

                <p className="flex items-center justify-center gap-1.5 text-xs text-white/50 mb-5">
                  <Smartphone size={13} />
                  Please keep your phone on and allow notifications.
                </p>

                <button
                  onClick={onDismiss}
                  className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-colors"
                >
                  Got it
                </button>
              </>
            )}

            {stage === 'near' && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-brand-600/30" />

                  <div className="absolute inset-2 rounded-full bg-brand-700/70 flex items-center justify-center">
                    <Users size={26} className="text-white" />
                  </div>

                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-400 text-white text-xs font-bold flex items-center justify-center border-2 border-brand-900">
                    {patientsAhead}
                  </span>
                </div>

                <h2 className="text-lg font-bold mb-1">
                  You are next!
                </h2>

                <p className="text-sm text-white/70 mb-6">
                  Only {patientsAhead} patient{patientsAhead === 1 ? '' : 's'} left before you.
                </p>

                <button
                  onClick={onViewQueue}
                  className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-colors"
                >
                  View Queue
                </button>
              </>
            )}
                        {stage === 'turn' && (
              <>
                {confettiDots.map((dot, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`absolute w-2 h-2 rounded-sm ${dot.color}`}
                    style={{
                      top: dot.top,
                      left: dot.left,
                    }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 14,
                  }}
                  className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check
                    size={36}
                    className="text-white"
                    strokeWidth={3}
                  />
                </motion.div>

                <h2 className="text-xl font-bold mb-2">
                  It's Your Turn
                </h2>

                <p className="text-sm text-white/70 mb-5">
                  Please proceed to the clinic and show your Patient ID at the
                  reception.
                </p>

                <div className="rounded-2xl bg-white/10 py-4 mb-5">
                  <p className="text-xs text-white/60 mb-1">
                    Your Token
                  </p>

                  <p className="text-4xl font-extrabold tracking-wide">
                    {myToken}
                  </p>
                </div>

                <div className="rounded-xl bg-green-500/10 border border-green-400/30 px-4 py-3">
                  <p className="text-sm text-green-300 font-medium">
                    Please enter the clinic now.
                  </p>
                </div>

                <p className="mt-5 text-xs text-white/50">
                  Tap the ✕ button to close this notification.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}