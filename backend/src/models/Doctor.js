import mongoose from 'mongoose'

// Mirrors mockData.js -> mockDoctorsByClinic[...].doctors[].
// `availability` is what DoctorSelect.jsx / clinic Appointments.jsx render
// as session cards (day + time range + how many already booked).
const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // 'Monday' ... 'Sunday'
    start: { type: String, required: true }, // '4:00 PM'
    end: { type: String, required: true },
  },
  { _id: false }
)

const doctorSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    name: { type: String, required: true },
    qualification: { type: String, default: '' },
    specialty: { type: String, required: true },
    rating: { type: Number, default: 0 },
    fee: { type: Number, required: true },
    active: { type: Boolean, default: true },
    availability: { type: [availabilitySchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Doctor', doctorSchema)
