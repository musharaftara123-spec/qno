import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'

const whyJoinPoints = [
  'Digital Queue Management',
  'Online Appointment Booking',
  'Live Queue Updates',
  'WhatsApp Notifications',
  'Analytics & Reports',
]

export default function ClinicLogin() {
  const navigate = useNavigate()
  const { login } = useClinicAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    try {
      const user = await login(email, password)
      // Role-based landing: both currently land on Queue Management since
      // that's the only built page an Operator is allowed to see anyway —
      // once the full Dashboard exists, Owners will redirect there instead.
      if (user.role === 'owner') {
        navigate('/clinic/dashboard')
      } else {
        navigate('/clinic/queue')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-100 dark:bg-gray-950 sm:py-8 font-sans">
      <div className="relative w-full sm:max-w-md flex flex-col h-screen h-[100dvh] sm:h-[50rem] sm:max-h-[50rem] bg-slate-50 dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-xl sm:border sm:border-gray-200 dark:sm:border-gray-800">
        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto">
          {/* Top Banner & Header Section */}
          <div className="relative w-full h-52 bg-indigo-50 dark:bg-gray-800 flex flex-col justify-between p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-indigo-300 blur-3xl transform -translate-y-10" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <button className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200/50">
                <Globe size={14} />
                <span>EN</span>
              </button>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-2">
                <Building2 size={26} />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Clinic Portal
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-[220px]">
                Manage your clinic, appointments and live queues.
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="px-5 -mt-3 relative z-20 pb-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <span className="relative bg-white dark:bg-gray-900 px-3 text-[10px] font-bold text-gray-400 tracking-wider">
                  OR
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/clinic/register')}
                className="w-full h-11 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Building2 size={16} />
                <span>Register Your Clinic</span>
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-indigo-50/50 dark:bg-gray-800/40 p-4 border border-indigo-100/50 dark:border-gray-800">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white mb-3">
                Why join Qno?
              </h3>
              <ul className="space-y-2">
                {whyJoinPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dev-only test credentials, safe to remove once real auth exists */}
            <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/40 text-[10px] text-amber-800 dark:text-amber-300 space-y-0.5">
              <p className="font-bold">Dev test accounts:</p>
              <p>Owner: owner@sunrise.com / owner123</p>
              <p>Operator: operator@sunrise.com / operator123</p>
            </div>
          </div>
        </main>

        <footer className="py-3 text-center text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          © 2026 Qno. All rights reserved.
        </footer>
      </div>
    </div>
  )
}