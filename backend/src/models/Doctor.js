import mongoose from 'mongoose'

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
    },

    start: {
      type: String,
      required: true,
    },

    end: {
      type: String,
      required: true,
    },

    totalSlots: {
      type: Number,
      default: 0,
      min: 0,
    },

    bookedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },

    bookedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
)

const doctorSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSlots: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    availability: [availabilitySchema],
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Doctor ||
  mongoose.model('Doctor', doctorSchema)