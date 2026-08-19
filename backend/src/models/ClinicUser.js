import mongoose from 'mongoose'

// Mirrors clinicMockData.js -> mockClinicAccounts. 'owner' sees the full
// sidebar (Dashboard, Doctors, Settings); 'operator' is scoped to
// assignedDoctorIds only — see role.middleware.js.
const clinicUserSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'operator'], default: 'owner' },
    assignedDoctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],

    // SHA-256 hash of the current refresh token (never the plaintext token).
    // Cleared on logout — that's what makes logout a real revocation
    // instead of just "the client stopped sending the cookie".
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
)

export default mongoose.model('ClinicUser', clinicUserSchema)
