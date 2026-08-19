import { Router } from 'express'
import {
  listAppointments,
  createWalkInAppointment,
} from '../../controllers/clinic/appointments.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { receptionistAppointmentSchema } from '../../validators/appointment.validator.js'

const router = Router()

router.use(requireAuth)
router.get('/', listAppointments)
router.post('/', validate(receptionistAppointmentSchema), createWalkInAppointment)

export default router
