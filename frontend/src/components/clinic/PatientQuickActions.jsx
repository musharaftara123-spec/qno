import React from 'react'
import toast from 'react-hot-toast'
import {
  MessageSquare,
  Phone,
  Printer,
  FileText,
  Share2,
} from 'lucide-react'

export default function PatientQuickActions({
  patientName = 'Patient',
  patientPhone = '',
  patientAge = '',
  patientGender = '',
  doctorName = 'Doctor',
  doctorQualification = '',
  appointmentDate = '',
  tokenNumber = '',
  patientId = '',
  size = 'sm',
}) {
  const cleanPhone = patientPhone.replace(/\D/g, '')

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

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=700')
    if (!printWindow) return toast.error('Please allow popups to print slip')

    const slipContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Slip - ${patientName}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #111; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 12px; margin-bottom: 16px; }
            .token { font-size: 32px; font-weight: bold; color: #2563eb; margin: 8px 0; }
            .field { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #666; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #888; border-top: 1px solid #eee; pt-12; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>CLINIC APPOINTMENT SLIP</h2>
            ${tokenNumber ? `<div class="token">TOKEN #${tokenNumber}</div>` : ''}
          </div>
          <div class="field"><span class="label">Patient Name:</span> <strong>${patientName}</strong></div>
          <div class="field"><span class="label">Patient ID:</span> <span>${patientId || 'N/A'}</span></div>
          <div class="field"><span class="label">Phone:</span> <span>${patientPhone || 'N/A'}</span></div>
          <div class="field"><span class="label">Age / Gender:</span> <span>${patientAge || 'N/A'} yrs / ${patientGender || 'N/A'}</span></div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
          <div class="field"><span class="label">Doctor:</span> <strong>${doctorName}</strong></div>
          ${doctorQualification ? `<div class="field"><span class="label">Qualification:</span> <span>${doctorQualification}</span></div>` : ''}
          <div class="field"><span class="label">Date:</span> <span>${appointmentDate || new Date().toLocaleDateString('en-GB')}</span></div>
          <div class="footer">
            <p>Please arrive 10 minutes prior to your session.</p>
            <p>Thank you!</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(slipContent)
    printWindow.document.close()
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
        title="Print Appointment Slip"
        onClick={handlePrintReceipt}
        className={`${btnClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        <Printer size={iconSize} />
      </button>
    </div>
  )
}