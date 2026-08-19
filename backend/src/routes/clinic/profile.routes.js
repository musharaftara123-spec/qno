import { Router } from 'express'
import { getProfile, updateProfile } from '../../controllers/clinic/profile.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import { updateProfileSchema } from '../../validators/clinic.validator.js'

const router = Router()

router.use(requireAuth)
router.get('/', getProfile)
router.patch('/', requireRole('owner'), validate(updateProfileSchema), updateProfile)

export default router
