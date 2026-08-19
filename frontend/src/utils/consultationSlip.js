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
  validity, // number of visits this slip is valid for
}) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const validityLabel = validity === 1 ? '1 Visit' : `${validity || 1} Visits`

  // Letterhead initial (first letter of the clinic name) used as a subtle
  // brand mark — falls back to a generic cross if no clinic name is set.
  const initial = (clinicName || '').trim().charAt(0).toUpperCase() || '+'

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
    background: #e5e7eb;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
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

  /* ---------- Header / letterhead ---------- */
  .header {
    position: relative;
    background: linear-gradient(120deg, #0e7490, #0ea5c4 60%, #22d3ee);
    padding: 11mm 14mm;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 6mm;
  }
  .header .mark {
    width: 16mm;
    height: 16mm;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16pt;
    font-weight: 700;
  }
  .header .titles { flex: 1; min-width: 0; }
  .header .clinic-name {
    font-size: 22pt;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: 0.2px;
  }
  .header .clinic-category {
    margin-top: 1mm;
    font-size: 9pt;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    opacity: 0.9;
  }
  .header .doctor-block {
    flex-shrink: 0;
    text-align: right;
    padding-left: 6mm;
    border-left: 1px solid rgba(255, 255, 255, 0.35);
  }
  .header .doctor-label {
    font-size: 7.5pt;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 1mm;
  }
  .header .doctor-name {
    font-size: 12pt;
    font-weight: 700;
    line-height: 1.3;
  }
  .header .doctor-qualification {
    margin-top: 0.5mm;
    font-size: 8.5pt;
    opacity: 0.9;
  }

  /* ---------- Contact strip ---------- */
  .contact-strip {
    display: flex;
    justify-content: space-between;
    gap: 4mm;
    padding: 3mm 14mm;
    background: #f0fdfe;
    border-bottom: 1px solid #cffafe;
    font-size: 8.5pt;
    color: #0e7490;
  }
  .contact-strip .item { display: flex; align-items: center; gap: 1.5mm; }

  /* ---------- Body ---------- */
  /* flex column that stretches to fill the rest of the A4 page, so the
     signature block (margin-top: auto below) always lands at the true
     bottom of the sheet, right above the footer — not just under the
     fields with a big empty gap after it. */
  .body {
    flex: 1;
    padding: 9mm 14mm 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6mm;
  }
  .meta-row .date {
    font-size: 10pt;
    color: #374151;
  }
  .meta-row .date b { color: #111827; }
  .validity-badge {
    display: inline-flex;
    align-items: center;
    gap: 1.5mm;
    padding: 1.5mm 4mm;
    border-radius: 999px;
    background: #ecfeff;
    border: 1px solid #a5f3fc;
    color: #0e7490;
    font-size: 8.5pt;
    font-weight: 600;
    white-space: nowrap;
  }

  /* Field grid — every blank line shares the same grid columns and the
     same border style/weight, so nothing lines up unevenly. */
  .field-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 6mm;
    row-gap: 5mm;
    font-size: 10.5pt;
  }
  .field { grid-column: span 12; }
  .field.col-4 { grid-column: span 4; }
  .field.col-6 { grid-column: span 6; }
  .field label {
    display: block;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 1.5mm;
  }
  .field .value-line {
    border-bottom: 1px solid #cbd5e1;
    height: 6mm;
    font-size: 10.5pt;
    color: #111827;
    padding-bottom: 0.5mm;
  }

  /* Pinned to the bottom of .body via margin-top: auto, so it always
     sits just above the footer regardless of how much (or little)
     content is above it. */
  .signature {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-bottom: 10mm;
  }
  .signature .block {
    text-align: center;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .signature .line {
    width: 50mm;
    border-bottom: 1px solid #9ca3af;
    margin-bottom: 2mm;
    height: 12mm;
  }

  /* ---------- Footer ---------- */
  .footer {
    background: #0e7490;
    color: #ffffff;
    font-size: 8pt;
    padding: 4mm 14mm;
    display: flex;
    justify-content: center;
  }
  .footer span { opacity: 0.9; }

  @media print {
    body { background: #ffffff; }
    .sheet { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="mark">${escapeHtml(initial)}</div>
      <div class="titles">
        <div class="clinic-name">${escapeHtml(clinicName || 'Clinic Name')}</div>
        ${clinicCategory ? `<div class="clinic-category">${escapeHtml(clinicCategory)}</div>` : ''}
      </div>
      <div class="doctor-block">
        <div class="doctor-label">Consulting Doctor</div>
        <div class="doctor-name">${escapeHtml(doctorName)}</div>
        ${doctorQualification ? `<div class="doctor-qualification">${escapeHtml(doctorQualification)}</div>` : ''}
      </div>
    </div>

    <div class="contact-strip">
      <div class="item">&#128205; ${escapeHtml(clinicAddress || '—')}</div>
      <div class="item">&#128222; ${escapeHtml(clinicPhone || '—')}</div>
      <div class="item">&#9993; ${escapeHtml(clinicEmail || '—')}</div>
    </div>

    <div class="body">
      <div class="meta-row">
        <div class="date">Date: <b>${escapeHtml(appointmentDate || today)}</b></div>
        <div class="validity-badge">Valid for ${escapeHtml(validityLabel)}</div>
      </div>

      <div class="field-grid">
        <div class="field col-6">
          <label>Patient Name</label>
          <div class="value-line">${escapeHtml(patientName || '')}</div>
        </div>
        <div class="field col-4">
          <label>Age</label>
          <div class="value-line">${escapeHtml(patientAge || '')}</div>
        </div>
        <div class="field col-4" style="grid-column: span 2;">
          <label>Gender</label>
          <div class="value-line">${escapeHtml(patientGender || '')}</div>
        </div>
        <div class="field col-4">
          <label>Weight</label>
          <div class="value-line"></div>
        </div>
        <div class="field col-6">
          <label>Diagnosis</label>
          <div class="value-line"></div>
        </div>
        <div class="field col-6">
          <label>Vitals (BP / Temp / Pulse)</label>
          <div class="value-line"></div>
        </div>
      </div>

      <div class="signature">
        <div class="block">
          <div class="line"></div>
          ${escapeHtml(doctorName)}${doctorQualification ? ` · ${escapeHtml(doctorQualification)}` : ''}<br />
          Signature
        </div>
      </div>
    </div>

    <div class="footer">
      <span>${escapeHtml(clinicName || 'Clinic')} &nbsp;·&nbsp; This slip is not valid for medico-legal purposes.</span>
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