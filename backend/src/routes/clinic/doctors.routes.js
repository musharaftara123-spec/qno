import { Router } from 'express'
import {
  listDoctors,
  createDoctor,
  updateDoctor,
  removeDoctor,
} from '../../controllers/clinic/doctors.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { createDoctorSchema, updateDoctorSchema } from '../../validators/doctor.validator.js'

const router = Router()

router.use(requireAuth)
router.get('/', listDoctors)
router.post('/', requireRole('owner'), validate(createDoctorSchema), createDoctor)
router.patch('/:id', requireRole('owner'), validate(updateDoctorSchema), updateDoctor)
router.delete('/:id', requireRole('owner'), removeDoctor)

export default router
