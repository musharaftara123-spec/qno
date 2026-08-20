import React from 'react'
import toast from 'react-hot-toast'
import { MessageSquare, Phone, Printer } from 'lucide-react'
import { printConsultationSlip } from '../../utils/consultationSlip.js'

export default function PatientQuickActions({
  patientName = 'Patient',
  patientPhone = '',
  patientAge = '',
  patientGender = '',
  doctorName = 'Doctor',
  doctorQualification = '',
  appointmentDate = '',
  patientId = '',
  size = 'sm',
  // Clinic letterhead info for the slip — pass these down from
  // clinicProfile (loaded via GET /clinic/profile) wherever this
  // component is used.
  clinicName = '',
  clinicCategory = '',
  clinicAddress = '',
  clinicPhone = '',
  clinicEmail = '',
  validity = 1,
}) {
  const cleanPhone = (patientPhone || '').replace(/\D/g, '')

  const handleWhatsApp = () => {
    if (!cleanPhone) {
      return toast.error('No phone number provided')
    }
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    const message = encodeURIComponent(
      `Hello ${patientName}, this is regarding your appointment with ${doctorName} on ${appointmentDate || 'today'}.`
    )
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank')
  }

  const handleCall = () => {
    if (!cleanPhone) {
      return toast.error('No phone number provided')
    }
    window.open(`tel:${cleanPhone}`, '_self')
  }

  // Uses the shared prescription-pad style slip from utils/consultationSlip.js
  // (same one used right after booking) instead of a separate inline
  // template, so every "Print" button in the app produces the same slip.
  const handlePrintReceipt = () => {
    const printed = printConsultationSlip({
      clinicName,
      clinicCategory,
      clinicAddress,
      clinicPhone,
      clinicEmail,
      doctorName,
      doctorQualification,
      patientName,
      patientAge,
      patientGender,
      appointmentDate,
      validity,
    })
    if (!printed) {
      toast.error('Please allow popups to print slip')
    }
  }

  const isXs = size === 'xs'
  const btnClass = isXs
    ? 'p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
    : 'p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'

  const iconSize = isXs ? 13 : 15

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        title="Send WhatsApp Message"
        onClick={handleWhatsApp}
        className={`${btnClass} text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40`}
      >
        <MessageSquare size={iconSize} />
      </button>

      <button
        type="button"
        title="Call Patient"
        onClick={handleCall}
        className={`${btnClass} text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40`}
      >
        <Phone size={iconSize} />
      </button>

      <button
        type="button"
        title="Print Consultation Slip"
        onClick={handlePrintReceipt}
        className={`${btnClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        <Printer size={iconSize} />
      </button>
    </div>
  )
}