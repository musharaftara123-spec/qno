import { Router } from 'express'
import {
  getQueue,
  startQueue,
  advanceQueue,
  noShow,
  toggleHold,
  endQueue,
  undoQueue,
} from '../../controllers/clinic/queue.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireAssignedDoctor } from '../../middleware/role.middleware.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/:doctorId',
  requireAssignedDoctor((req) => req.params.doctorId),
  getQueue
)

router.post(
  '/:doctorId/start',
  requireAssignedDoctor((req) => req.params.doctorId),
  startQueue
)

router.post(
  '/:doctorId/next',
  requireAssignedDoctor((req) => req.params.doctorId),
  advanceQueue
)

router.post(
  '/:doctorId/no-show',
  requireAssignedDoctor((req) => req.params.doctorId),
  noShow
)

router.post(
  '/:doctorId/hold',
  requireAssignedDoctor((req) => req.params.doctorId),
  toggleHold
)

router.post(
  '/:doctorId/end',
  requireAssignedDoctor((req) => req.params.doctorId),
  endQueue
)

router.post(
  '/:doctorId/undo',
  requireAssignedDoctor((req) => req.params.doctorId),
  undoQueue
)

export default router
