import Clinic from '../../models/Clinic.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'

// GET /api/clinic/profile -> mirrors getClinicById() in mockData.js
export const getProfile = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.clinicUser.clinic)
  if (!clinic) throw new ApiError(404, 'Clinic not found')
  res.json(clinic)
})

// PATCH /api/clinic/profile -> mirrors updateClinicProfile() in mockData.js
export const updateProfile = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(req.clinicUser.clinic, req.body, {
    new: true,
    runValidators: true,
  })
  if (!clinic) throw new ApiError(404, 'Clinic not found')
  res.json(clinic)
})
