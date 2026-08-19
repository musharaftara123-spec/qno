import { Router } from 'express'
import {
  bookAppointment,
  lookupAppointment,
  payAppointment,
} from '../../controllers/public/appointments.controller.js'
import { validate } from '../../middleware/validate.middleware.js'
import { bookAppointmentSchema } from '../../validators/appointment.validator.js'
import { publicBookingLimiter } from '../../middleware/rateLimiter.js'

const router = Router()

router.post('/', publicBookingLimiter, validate(bookAppointmentSchema), bookAppointment)
router.get('/lookup/:patientId', lookupAppointment)
router.post('/:id/pay', payAppointment)

export default router
