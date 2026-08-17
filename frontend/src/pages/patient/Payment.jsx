import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import MobileLayout from '../../components/layout/MobileLayout.jsx'
import { lookupAppointmentByAppointmentId, markAppointmentPaid } from '../../services/mockData.js'

export default function Payment() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    setAppointment(lookupAppointmentByAppointmentId(appointmentId))
  }, [appointmentId])

  const consultationFee = appointment?.fee ?? 0

  const handlePay = async () => {
    setProcessing(true)
    // TODO (Payments phase): replace with real Razorpay checkout flow
    await new Promise((resolve) => setTimeout(resolve, 900))
    markAppointmentPaid(appointmentId)
    setProcessing(false)
    toast.success('Payment successful')
    navigate(`/appointment/${appointmentId}/success`)
  }

  if (!appointment) {
    return (
      <MobileLayout title="Payment" subtitle="Complete your consultation fee">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
          Loading appointment details...
        </p>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Payment" subtitle="Complete your consultation fee">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-soft dark:shadow-softDark mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Consultation Fee
          </span>
          <span className="font-semibold">₹{consultationFee}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
            ₹{consultationFee}
          </span>
        </div>
      </motion.div>

      <button
        onClick={handlePay}
        disabled={processing}
        className="w-full h-12 rounded-2xl bg-brand-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold active:scale-[0.98] transition-transform"
      >
        {processing ? 'Processing...' : `Pay ₹${consultationFee}`}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
        Secured payment. You'll receive your Patient ID after payment.
      </p>
    </MobileLayout>
  )
}