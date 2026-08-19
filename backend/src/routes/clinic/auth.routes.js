import { Router } from 'express'
import { register, login, refresh, logout, me, addStaff } from '../../controllers/clinic/auth.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { loginLimiter } from '../../middleware/rateLimiter.js'
import { registerClinicSchema, loginSchema } from '../../validators/clinic.validator.js'

const router = Router()

router.post('/register', validate(registerClinicSchema), register)
router.post('/login', loginLimiter, validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.post('/staff', requireAuth, requireRole('owner'), addStaff)

export default router
