// Builds a printable consultation slip (prescription-pad style letterhead)
// for one patient/appointment, and sends it straight to the browser's
// print dialog. Pulls the doctor's name + the clinic's address/phone/email
// and "valid for N visit(s)" setting from the clinic's own profile — so
// editing Clinic Profile is what controls what prints here.

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

export function printConsultationSlip({
  clinicName,
  clinicAddress,
  clinicPhone,
  clinicEmail,
  doctorName,
  doctorQualification,
  patientName,
  patientAge,
  patientGender,
  appointmentDate,
  validity, // number of visits this slip is valid for
}) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const validityLabel = validity === 1 ? '1 Visit' : `${validity || 1} Visits`

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Consultation Slip - ${escapeHtml(patientName)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1f2937;
    background: #f3f4f6;
  }
  .sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .header {
    position: relative;
    height: 46mm;
    background: linear-gradient(135deg, #0ea5c4, #22d3ee);
    overflow: hidden;
    padding: 10mm 14mm 0;
    color: #ffffff;
  }
  .header .wave {
    position: absolute;
    left: 0; right: 0; bottom: -1px;
    height: 22mm;
  }
  .header h1 {
    margin: 4mm 0 0;
    font-size: 26pt;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .header h1 span { font-weight: 300; opacity: 0.95; }
  .header .qualification {
    margin-top: 2mm;
    font-size: 9pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.9;
  }
  .body {
    flex: 1;
    padding: 10mm 14mm 0;
    position: relative;
  }
  .fields { font-size: 11pt; line-height: 2.1; }
  .fields .row { display: flex; gap: 8mm; margin-bottom: 1mm; }
  .fields .field { display: flex; align-items: flex-end; gap: 2mm; }
  .fields .field b { white-space: nowrap; color: #374151; font-weight: 600; }
  .fields .blank { flex: 1; border-bottom: 1px solid #cbd5e1; min-width: 30mm; height: 5mm; }
  .validity-badge {
    display: inline-flex;
    align-items: center;
    gap: 2mm;
    margin-top: 4mm;
    padding: 2mm 5mm;
    border-radius: 999px;
    background: #ecfeff;
    border: 1px solid #a5f3fc;
    color: #0e7490;
    font-size: 9pt;
    font-weight: 600;
  }
  .watermark {
    position: absolute;
    left: 10mm;
    top: 55mm;
    font-size: 90pt;
    color: #0ea5c4;
    opacity: 0.06;
    pointer-events: none;
    user-select: none;
  }
  .signature {
    position: absolute;
    right: 14mm;
    bottom: 32mm;
    text-align: center;
    font-size: 9pt;
    color: #6b7280;
  }
  .signature .line {
    width: 45mm;
    border-bottom: 1px solid #9ca3af;
    margin-bottom: 2mm;
    height: 10mm;
  }
  .footer {
    background: #0ea5c4;
    color: #ffffff;
    font-size: 8.5pt;
    padding: 4mm 14mm;
    display: flex;
    justify-content: space-between;
    gap: 4mm;
  }
  .footer .item { display: flex; align-items: center; gap: 2mm; opacity: 0.95; }
  @media print {
    body { background: #ffffff; }
    .sheet { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <svg class="wave" viewBox="0 0 800 140" preserveAspectRatio="none">
        <path d="M0,60 C200,140 500,0 800,90 L800,140 L0,140 Z" fill="#ffffff" opacity="0.14" />
      </svg>
      <h1>${escapeHtml(doctorName)}</h1>
      ${doctorQualification ? `<div class="qualification">${escapeHtml(doctorQualification)}</div>` : ''}
    </div>

    <div class="body">
      <div class="watermark">&#9877;</div>

      <div class="fields">
        <div class="row">
          <div class="field" style="flex: 2;"><b>Patient Name:</b><span class="blank"></span></div>
          <div class="field" style="flex: 1;"><b>Date:</b><span class="blank">${escapeHtml(appointmentDate || today)}</span></div>
        </div>
        <div class="row">
          <div class="field" style="flex: 1;"><b>Age:</b><span class="blank">${escapeHtml(patientAge)}</span></div>
          <div class="field" style="flex: 1;"><b>Gender:</b><span class="blank">${escapeHtml(patientGender)}</span></div>
          <div class="field" style="flex: 1;"><b>Weight:</b><span class="blank"></span></div>
        </div>
        <div class="row">
          <div class="field" style="flex: 1;"><b>Diagnosis:</b><span class="blank"></span></div>
        </div>
      </div>

      <div class="validity-badge">Valid for: ${escapeHtml(validityLabel)}</div>

      <div class="signature">
        <div class="line"></div>
        Signature
      </div>
    </div>

    <div class="footer">
      <div class="item">&#128205; ${escapeHtml(clinicAddress || clinicName)}</div>
      <div class="item">&#128222; ${escapeHtml(clinicPhone || '—')}</div>
      <div class="item">&#9993; ${escapeHtml(clinicEmail || '—')}</div>
    </div>
  </div>
  <script>
    window.onload = function () {
      window.print();
    };
  </script>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=850,height=1100')
  if (!printWindow) return false
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  return true
}