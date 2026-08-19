import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { setAccessToken } from '../services/api.js'

const ClinicAuthContext = createContext(null)

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

// ⚠️ DEV/MOCK ONLY. This whole function is skipped once USE_MOCKS is
// false — real login() below talks to the actual backend instead.
async function mockLoginCheck(email, password) {
  const { mockClinicAccounts } = await import('../services/clinicMockData.js')
  await new Promise((resolve) => setTimeout(resolve, 500))

  const account = mockClinicAccounts.find(
    (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
  )
  if (!account || account.password !== password) {
    throw new Error('Invalid email or password')
  }
  return {
    userId: account.userId,
    name: account.name,
    email: account.email,
    role: account.role,
    assignedDoctorIds: account.assignedDoctorIds,
  }
}

export function ClinicAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, try to silently restore a session using the httpOnly
  // refresh cookie (JS never touches the token itself — the browser just
  // sends it automatically because api.js has withCredentials: true).
  // If there's no valid cookie, this fails quietly and the user is
  // treated as logged out, same as any first visit.
  useEffect(() => {
    async function restoreSession() {
      if (USE_MOCKS) {
        // No real backend to refresh against in mock mode — nothing to restore.
        setLoading(false)
        return
      }
      try {
        const { data } = await api.post('/clinic/auth/refresh')
        setAccessToken(data.accessToken)
        setUser(data.user)
      } catch {
        setAccessToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (email, password) => {
    if (USE_MOCKS) {
      const sessionUser = await mockLoginCheck(email, password)
      setUser(sessionUser)
      return sessionUser
    }

    const { data } = await api.post('/clinic/auth/login', { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    if (!USE_MOCKS) {
      try {
        await api.post('/clinic/auth/logout') // revokes the refresh token server-side
      } catch {
        // even if this fails, still clear local state below
      }
    }
    setAccessToken(null)
    setUser(null)
  }

  return (
    <ClinicAuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </ClinicAuthContext.Provider>
  )
}

export function useClinicAuth() {
  const ctx = useContext(ClinicAuthContext)
  if (!ctx) throw new Error('useClinicAuth must be used within a ClinicAuthProvider')
  return ctx
}