import mongoose from 'mongoose'

const queueStateSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    isStarted: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    isHeld: {
      type: Boolean,
      default: false,
    },
    isEnded: {
      type: Boolean,
      default: false,
    },
    lastAction: {
      type: String,
      enum: ['next', 'no_show', null],
      default: null,
    },
    lastAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    previousCurrentAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  { timestamps: true }
)

queueStateSchema.index({ doctor: 1, appointmentDate: 1 }, { unique: true })

export default mongoose.model('QueueState', queueStateSchema)