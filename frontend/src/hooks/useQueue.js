import { useEffect, useState, useCallback } from 'react'
import api from '../services/api.js'
import { useSocket } from '../contexts/SocketContext.jsx'

/**
 * Tracks a clinic's live queue state.
 * Fetches initial data via REST, then stays in sync via Socket.io events.
 */
export function useQueue(clinicId, doctorId) {
  const { socket, connected } = useSocket()
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQueue = useCallback(async () => {
    if (!clinicId || !doctorId) return
    try {
      setLoading(true)
      const { data } = await api.get(`/queue/${clinicId}/${doctorId}`)
      setQueue(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [clinicId, doctorId])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  useEffect(() => {
    if (!socket || !connected || !clinicId || !doctorId) return

    const room = `queue:${clinicId}:${doctorId}`
    socket.emit('join-room', room)

    const handleUpdate = (updatedQueue) => setQueue(updatedQueue)
    socket.on('queue-updated', handleUpdate)

    return () => {
      socket.emit('leave-room', room)
      socket.off('queue-updated', handleUpdate)
    }
  }, [socket, connected, clinicId, doctorId])

  return { queue, loading, error, refetch: fetchQueue }
}