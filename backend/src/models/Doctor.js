import mongoose from 'mongoose';

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
      required: true,
      min: 1,
      default: 1,
    },
    bookedSlots: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    qualification: {
      type: String,
    },
    fee: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    availability: [availabilitySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);