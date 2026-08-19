import mongoose from 'mongoose'

// Replaces the localStorage `clinicQueue_slotCounters` counter from
// mockData.js. One document per doctor+day slot, incremented atomically
// (see appointment.service.js) so concurrent bookings can't race past
// MAX_ONLINE_BOOKINGS_PER_SLOT.
const slotCounterSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  day: { type: String, required: true },
  count: { type: Number, default: 0 },
})

slotCounterSchema.index({ doctor: 1, day: 1 }, { unique: true })

export default mongoose.model('SlotCounter', slotCounterSchema)
