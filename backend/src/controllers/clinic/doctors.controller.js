import Doctor from '../../models/Doctor.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'

// GET /api/clinic/doctors -> ClinicDoctors.jsx "All Doctors" list
export const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ clinic: req.clinicUser.clinic }).sort({ createdAt: -1 })
  res.json(doctors)
})

// POST /api/clinic/doctors -> ClinicDoctors.jsx "Add Doctor" modal
export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create({ ...req.body, clinic: req.clinicUser.clinic })
  res.status(201).json(doctor)
})

// PATCH /api/clinic/doctors/:id -> edit details, toggle active (Power icon)
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.params.id, clinic: req.clinicUser.clinic },
    req.body,
    { new: true, runValidators: true }
  )
  if (!doctor) throw new ApiError(404, 'Doctor not found')
  res.json(doctor)
})

// DELETE /api/clinic/doctors/:id -> Trash icon
export const removeDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, clinic: req.clinicUser.clinic })
  if (!doctor) throw new ApiError(404, 'Doctor not found')
  res.status(204).send()
})
