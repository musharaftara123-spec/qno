import { asyncHandler } from '../../utils/asyncHandler.js'
import * as queueService from '../../services/queue.service.js'
import { getIO } from '../../sockets/queue.socket.js'

function emitQueueChanged(doctorId) {
  getIO()?.to(`doctor:${doctorId}`).emit('queue:changed', { doctorId })
}

export const getQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.getQueueForDoctor(
    req.params.doctorId,
    req.query.date || undefined
  )
  res.json(queue)
})

export const startQueue = asyncHandler(async (req, res) => {
  const state = await queueService.startQueue(
    req.params.doctorId,
    req.body?.date || req.query?.date
  )
  emitQueueChanged(req.params.doctorId)
  res.json(state)
})

export const advanceQueue = asyncHandler(async (req, res) => {
  const next = await queueService.advanceQueue(
    req.params.doctorId,
    req.body?.date || req.query?.date
  )
  emitQueueChanged(req.params.doctorId)
  res.json(next)
})

export const noShow = asyncHandler(async (req, res) => {
  const appointment = await queueService.markNoShow(req.body.appointmentId)
  emitQueueChanged(String(appointment.doctor))
  res.json(appointment)
})

export const toggleHold = asyncHandler(async (req, res) => {
  const state = await queueService.toggleHold(
    req.params.doctorId,
    req.body?.date || req.query?.date,
    req.body?.isHeld
  )
  emitQueueChanged(req.params.doctorId)
  res.json(state)
})

export const endQueue = asyncHandler(async (req, res) => {
  const state = await queueService.endQueue(
    req.params.doctorId,
    req.body?.date || req.query?.date
  )
  emitQueueChanged(req.params.doctorId)
  res.json(state)
})

export const undoQueue = asyncHandler(async (req, res) => {
  const queue = await queueService.undoLastAction(
    req.params.doctorId,
    req.body?.date || req.query?.date
  )
  emitQueueChanged(req.params.doctorId)
  res.json(queue)
})
