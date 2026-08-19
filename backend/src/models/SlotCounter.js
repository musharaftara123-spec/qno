import mongoose from 'mongoose'

const slotCounterSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// Ensure unique index for each clinic key
slotCounterSchema.index({ clinicId: 1, key: 1 }, { unique: true })

export const SlotCounter =
  mongoose.models.SlotCounter || mongoose.model('SlotCounter', slotCounterSchema)

export default SlotCounter