import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Shield,
  CheckCircle2,
} from 'lucide-react'

export default function ClinicRegister() {
  const navigate = useNavigate()

  // Step 1: Form, Step 2: OTP, Step 3: Success
  const [step, setStep] = useState(1)

  // Form State
  const [formData, setFormData] = useState({
    clinicName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    agreed: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // OTP State (6 Digits)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(45)
  const [canResend, setCanResend] = useState(false)
  const otpRefs = Array.from({ length: 6 }, () => useRef(null))

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Resend Timer logic
  useEffect(() => {
    let interval = null
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  // Handle Form Submit -> Proceed to OTP
  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.agreed) {
      setError('Please accept the Terms & Conditions.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(2) // Move to OTP
      setTimer(45)
      setCanResend(false)
    }, 1000)
  }

  // 6-digit OTP handling
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  // Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setError('')
    const code = otp.join('')

    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(3) // Success
    }, 1200)
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex justify-center bg-gray-100 dark:bg-gray-950 sm:py-8 font-sans">
      <div className="relative w-full sm:max-w-md flex flex-col h-screen h-[100dvh] sm:h-[50rem] sm:max-h-[50rem] bg-slate-50 dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-xl sm:border sm:border-gray-200 dark:sm:border-gray-800">
        
        {/* Navigation Bar */}
        <header className="px-4 py-3 flex items-center shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate('/clinic-login'))}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
        </header>

        {/* Scrollable Form Area */}
        <main className="flex-1 overflow-y-auto px-5 py-4">
          
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {/* Header Title + Illustration Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Register Your Clinic
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Create your clinic account and start managing your queue.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-gray-800 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Clinic Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Clinic Name
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="clinicName"
                      required
                      value={formData.clinicName}
                      onChange={handleInputChange}
                      placeholder="Enter clinic name"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="ownerName"
                      required
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Enter owner name"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password"
                      className="w-full h-10 pl-9 pr-9 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full h-10 pl-9 pr-9 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Clinic Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Clinic Address
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* City and Pincode Inline */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Pincode
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreed"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="agreed" className="text-[10px] text-gray-600 dark:text-gray-400">
                    I agree to the <span className="font-bold text-indigo-600">Terms & Conditions</span> and <span className="font-bold text-indigo-600">Privacy Policy</span>
                  </label>
                </div>

                {/* Create Account Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Create Account</span>}
                </motion.button>

                <p className="text-center text-[11px] text-gray-500 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/clinic-login')}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {/* STEP 2: OTP Verification Screen */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="pt-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Verify Your Number
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We have sent a 6-digit OTP to
                  </p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {formData.phone || '+91 98765 43210'}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                  <ShieldCheck size={26} />
                </div>
              </div>

              {/* OTP Input Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-3">
                      Enter 6-digit OTP
                    </label>

                    {/* 6 Input Boxes */}
                    <div className="flex justify-between gap-1.5">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>Didn't receive OTP?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTimer(45)
                          setCanResend(false)
                        }}
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        Resend Now
                      </button>
                    ) : (
                      <span className="font-bold text-indigo-600">
                        Resend in 00:{timer < 10 ? `0${timer}` : timer}
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Verify & Continue</span>}
                  </motion.button>
                </form>
              </div>

              {/* Secure & Trusted Info Card */}
              <div className="rounded-2xl bg-indigo-50/50 dark:bg-gray-800/40 p-4 border border-indigo-100/50 dark:border-gray-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-gray-800 text-indigo-600 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Secure & Trusted
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Your data is safe with Qno. We never share your information.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Complete */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Verification Complete!
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Your clinic account is ready.
              </p>
              <button
                onClick={() => navigate('/clinic/dashboard')}
                className="mt-6 w-full h-11 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </main>

        <footer className="py-3 text-center text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          © 2026 Qno. All rights reserved.
        </footer>
      </div>
    </div>
  )
}