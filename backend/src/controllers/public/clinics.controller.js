import Clinic from '../../models/Clinic.js'
import Doctor from '../../models/Doctor.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'

// GET /api/clinics -> mirrors mockClinics (ClinicSelect.jsx)
export const listClinics = asyncHandler(async (req, res) => {
  const clinics = await Clinic.find().sort({ rating: -1 })
  res.json(clinics)
})

// GET /api/clinics/:clinicId -> mirrors mockClinics.find (ClinicDetail.jsx)
export const getClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.clinicId)
  if (!clinic) throw new ApiError(404, 'Clinic not found')
  res.json(clinic)
})

// GET /api/clinics/:clinicId/doctors
// -> mirrors mockDoctorsByClinic[clinicId] shape: { clinicName, doctors }
export const listClinicDoctors = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.clinicId)
  if (!clinic) throw new ApiError(404, 'Clinic not found')

  const doctors = await Doctor.find({ clinic: clinic._id, active: true })
  res.json({ clinicName: clinic.name, doctors })
})

// GET /api/clinics/:clinicId/doctor/:doctorId
// -> mirrors mockDoctorDetail[doctorId] shape: { doctor, availableSlots }
// Note: availableSlots (loose time strings) isn't really used by the
// session-picker flow anymore — kept for backward compatibility with
// any page still reading it; availability sessions live on the doctor.
export const getDoctorDetail = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.doctorId, clinic: req.params.clinicId })
  if (!doctor) throw new ApiError(404, 'Doctor not found')
  res.json({ doctor, availableSlots: [] })
})
