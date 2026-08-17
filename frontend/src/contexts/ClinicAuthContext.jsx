import React, { createContext, useContext, useEffect, useState } from 'react'
import { mockClinicAccounts } from '../services/clinicMockData.js'

const STORAGE_KEY = 'clinicQueue_clinicAuth'
const ClinicAuthContext = createContext(null)

export function ClinicAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on load (e.g. page refresh)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // corrupted/unavailable storage — treat as logged out
    } finally {
      setLoading(false)
    }
  }, [])

  // Mock login — checks against clinicMockAccounts.
  // TODO (backend phase): replace with a real POST /api/auth/clinic-login
  // call that verifies a hashed password server-side and returns a JWT.
  // The client should never again compare plaintext passwords once that
  // exists — this function's insides get swapped, not its signature.
  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // simulate network

    const account = mockClinicAccounts.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (!account || account.password !== password) {
      throw new Error('Invalid email or password')
    }

    const sessionUser = {
      userId: account.userId,
      name: account.name,
      email: account.email,
      role: account.role,
      assignedDoctorIds: account.assignedDoctorIds,
    }

    setUser(sessionUser)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
    } catch {
      // non-critical if storage is unavailable — user stays logged in for this tab session via state
    }

    return sessionUser
  }

  const logout = () => {
    setUser(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // no-op
    }
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