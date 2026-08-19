import { asyncHandler } from '../../utils/asyncHandler.js'
import * as queueService from '../../services/queue.service.js'
import { getIO } from '../../sockets/queue.socket.js'

// GET /api/clinic/queue/:doctorId?date=19 Aug 2026
export const getQueue = asyncHandler(async (req, res) => {
  const { doctorId } = req.params
  const { date } = req.query
  const queue = await queueService.getQueueForDoctor(doctorId, date)
  res.json(queue)
})

// POST /api/clinic/queue/:doctorId/next
// Advances the token, then broadcasts to any patient watching this
// doctor's queue in real time instead of them having to poll.
export const advanceQueue = asyncHandler(async (req, res) => {
  const { doctorId } = req.params
  const { date } = req.body
  const next = await queueService.advanceQueue(doctorId, date)

  getIO()?.to(`doctor:${doctorId}`).emit('token:advanced', {
    doctorId,
    currentToken: next?.tokenNumber ?? null,
  })

  res.json(next)
})

// POST /api/clinic/queue/:doctorId/no-show
export const noShow = asyncHandler(async (req, res) => {
  const appointment = await queueService.markNoShow(req.body.appointmentId)
  res.json(appointment)
})
