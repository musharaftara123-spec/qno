import React from 'react'
import { Navigate } from 'react-router-dom'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'

export default function ProtectedClinicRoute({ children }) {
  const { isAuthenticated, loading } = useClinicAuth()

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-surface-dark">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/clinic-login" replace />
  }

  return children
}