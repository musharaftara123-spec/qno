import http from 'http'
import dns from 'node:dns'

import { env } from './src/config/env.js'
import { connectDB } from './src/config/db.js'
import { createApp } from './src/app.js'
import { initSocket } from './src/sockets/queue.socket.js'

dns.setServers(['8.8.8.8', '1.1.1.1'])
dns.setDefaultResultOrder('ipv4first')

async function main() {
  await connectDB()

  const app = createApp()
  const httpServer = http.createServer(app)

  initSocket(httpServer)

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 QNO backend running on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})