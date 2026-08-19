import { Server } from 'socket.io'
import { env } from '../config/env.js'

let io = null

// Called once from server.js with the HTTP server. A client (patient
// tracking their queue position) joins room `doctor:<doctorId>` and
// receives `token:advanced` events whenever the clinic calls the next
// patient — see queue.controller.js's advanceQueue().
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN.split(',') },
  })

  io.on('connection', (socket) => {
    socket.on('watch:doctor', (doctorId) => {
      socket.join(`doctor:${doctorId}`)
    })

    socket.on('unwatch:doctor', (doctorId) => {
      socket.leave(`doctor:${doctorId}`)
    })
  })

  return io
}

export function getIO() {
  return io
}
