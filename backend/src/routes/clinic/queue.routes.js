import { Router } from 'express'
import { getQueue, advanceQueue, noShow } from '../../controllers/clinic/queue.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireAssignedDoctor } from '../../middleware/role.middleware.js'

const router = Router()

router.use(requireAuth)
router.get('/:doctorId', requireAssignedDoctor((req) => req.params.doctorId), getQueue)
router.post('/:doctorId/next', requireAssignedDoctor((req) => req.params.doctorId), advanceQueue)
router.post('/:doctorId/no-show', noShow)

export default router
