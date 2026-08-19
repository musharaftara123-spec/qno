import mongoose from 'mongoose'

// Mirrors the appointment object shape createMockAppointment() builds in
// mockData.js — same field names throughout, so the frontend needs zero
// remapping once it talks to this API instead of localStorage.
const appointmentSchema = new mongoose.Schema(
  {
    // Public-facing id patients use to track their queue position
    // (QNO-###### format) — separate from Mongo's _id on purpose, so it
    // never leaks the internal document id.
    patientId: { type: String, required: true, unique: true },

    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    clinicName: { type: String, required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },

    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    purpose: { type: String, default: '' },

    appointmentDate: { type: String, required: true }, // '19 Aug 2026'
    appointmentDay: { type: String, required: true }, // 'Wednesday'
    session: { type: String, required: true }, // '8:00 AM - 10:00 AM'

    tokenNumber: { type: Number, required: true },
    currentToken: { type: Number, default: 1 },

    fee: { type: Number, required: true },

    // 'online' = booked via the public app (subject to the 30-per-slot
    // cap). 'receptionist' = booked at the counter (no cap).
    bookedBy: { type: String, enum: ['online', 'receptionist'], required: true },

    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'waiting', 'your_turn', 'completed', 'cancelled'],
      default: 'pending_payment',
    },
  },
  { timestamps: true }
)

appointmentSchema.index({ clinic: 1, createdAt: -1 })
appointmentSchema.index({ doctor: 1, appointmentDate: 1 })

export default mongoose.model('Appointment', appointmentSchema)
