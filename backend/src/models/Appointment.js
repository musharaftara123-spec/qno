import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    clinicName: { type: String, required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    purpose: { type: String, default: '' },

    appointmentDate: { type: String, required: true },
    appointmentDay: { type: String, required: true },
    session: { type: String, required: true },
    tokenNumber: { type: Number, required: true },
    currentToken: { type: Number, default: 1 },

    // Determines actual call order in the queue, separate from tokenNumber.
    // tokenNumber is the patient-facing identity (never changes once
    // booked); queueSequence is what the queue is actually sorted by.
    // They start equal. When a patient is skipped, only queueSequence
    // moves to the back — the patient keeps their original token number.
    queueSequence: {
      type: Number,
      default: function () {
        return this.tokenNumber
      },
    },

    fee: { type: Number, required: true },
    bookedBy: { type: String, enum: ['online', 'receptionist'], required: true },

    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'waiting', 'your_turn', 'completed', 'cancelled'],
      default: 'pending_payment',
    },

    paymentMethod: { type: String, enum: ['online', 'offline'], default: null },
    paidAt: { type: Date, default: null },

    // Queue timing fields. These let the backend calculate real consultation
    // duration instead of using a hard-coded/random average.
    queueStartedAt: { type: Date, default: null },
    queueCompletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

appointmentSchema.index({ clinic: 1, createdAt: -1 })
appointmentSchema.index({ doctor: 1, appointmentDate: 1 })
appointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1, tokenNumber: 1 })

export default mongoose.model('Appointment', appointmentSchema)