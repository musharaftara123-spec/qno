import Appointment from '../models/Appointment.js'

// Same QNO-###### format as generatePatientId() in mockData.js, but now
// checks uniqueness against the DB instead of just trusting randomness —
// a real appointments table can collide over enough volume, localStorage
// never could (single browser, tiny dataset).
export async function generatePatientId() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const num = Math.floor(100000 + Math.random() * 900000)
    const candidate = `QNO-${num}`
    const exists = await Appointment.exists({ patientId: candidate })
    if (!exists) return candidate
  }
  throw new Error('Could not generate a unique patient ID — try again')
}
