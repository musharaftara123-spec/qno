import React from 'react'
import { Phone, MessageCircle, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClinicById } from '../../services/mockData.js'
import { printConsultationSlip } from '../../utils/consultationSlip.js'

// Three quick actions available next to any booked patient — on the
// Appointments "Recent Appointments" panel and the Patients table:
//   1. Call the patient directly
//   2. WhatsApp them an "appointment reaching" reminder
//   3. Print a consultation slip (clinic + doctor letterhead, pulling the
//      visit-validity setting from that clinic's profile)
export default function PatientQuickActions({
  clinicId,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  doctorName,
  doctorQualification,
  appointmentDate,
  size = 'sm', // 'sm' | 'xs'
}) {
  const dim = size === 'xs' ? 'w-7 h-7' : 'w-8 h-8'
  const iconSize = size === 'xs' ? 13 : 14

  const cleanPhone = (patientPhone || '').replace(/\D/g, '')

  const handleCall = (e) => {
    e.stopPropagation()
    if (!cleanPhone) {
      toast.error('No phone number on file for this patient.')
      return
    }
    window.location.href = `tel:${cleanPhone}`
  }

  const handleWhatsapp = (e) => {
    e.stopPropagation()
    if (!cleanPhone) {
      toast.error('No phone number on file for this patient.')
      return
    }
    const clinic = getClinicById(clinicId)
    const clinicName = clinic?.name || 'the clinic'
    const message = `Hi ${patientName}, your appointment at ${clinicName}${
      doctorName ? ` with ${doctorName}` : ''
    } is reaching. Please be available at the clinic.`
    const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handlePrint = (e) => {
    e.stopPropagation()
    const clinic = getClinicById(clinicId)
    if (!clinic) {
      toast.error('Clinic profile not found.')
      return
    }
    const opened = printConsultationSlip({
      clinicName: clinic.name,
      clinicAddress: clinic.address,
      clinicPhone: clinic.phone,
      clinicEmail: clinic.email,
      doctorName,
      doctorQualification,
      patientName,
      patientAge,
      patientGender,
      appointmentDate,
      validity: clinic.consultationValidity,
    })
    if (!opened) {
      toast.error('Please allow pop-ups to print the consultation slip.')
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleCall}
        title="Call patient"
        className={`${dim} rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
      >
        <Phone size={iconSize} />
      </button>
      <button
        onClick={handleWhatsapp}
        title="WhatsApp: appointment reaching"
        className={`${dim} rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors`}
      >
        <MessageCircle size={iconSize} />
      </button>
      <button
        onClick={handlePrint}
        title="Print consultation slip"
        className={`${dim} rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
      >
        <Printer size={iconSize} />
      </button>
    </div>
  )
}