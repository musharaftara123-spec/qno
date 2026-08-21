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
    // Full undo history (LIFO stack), not just the single last action.
    // This lets the clinic press Undo repeatedly to walk back several
    // Next/Skip actions in a row, matching the "press it multiple times
    // to go back further" behaviour promised in the UI.
    history: {
      type: [
        {
          type: {
            type: String,
            enum: ['next', 'no_show'],
            required: true,
          },
          appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null,
          },
          // For 'next': the appointment (if any) that was 'your_turn'
          // before this action promoted a new patient.
          previousCurrentAppointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null,
          },
          // For 'no_show': the appointment's queueSequence before it was
          // pushed to the back of the queue, so undo can restore its
          // original position.
          previousQueueSequence: {
            type: Number,
            default: null,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
)

queueStateSchema.index({ doctor: 1, appointmentDate: 1 }, { unique: true })

export default mongoose.model('QueueState', queueStateSchema)