import mongoose from 'mongoose'

// Mirrors frontend/src/services/mockData.js -> mockClinics entries, plus
// the fields ClinicProfile.jsx (Settings) edits via ALL_FACILITY_OPTIONS.
const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'General Clinic' },
    about: { type: String, default: '' },
    address: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    timings: { type: String, default: '' },
    consultationFee: { type: Number, default: 0 },
    facilities: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Clinic', clinicSchema)
