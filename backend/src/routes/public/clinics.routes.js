import { Router } from 'express'
import {
  listClinics,
  getClinic,
  listClinicDoctors,
  getDoctorDetail,
} from '../../controllers/public/clinics.controller.js'

const router = Router()

router.get('/', listClinics)
router.get('/:clinicId', getClinic)
router.get('/:clinicId/doctors', listClinicDoctors)
router.get('/:clinicId/doctor/:doctorId', getDoctorDetail)

export default router
