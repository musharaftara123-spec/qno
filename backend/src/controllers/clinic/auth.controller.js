import mongoose from 'mongoose'
import Clinic from '../../models/Clinic.js'
import ClinicUser from '../../models/ClinicUser.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshCookieOptions,
} from '../../services/auth.service.js'

function publicUser(user) {
  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId: user.clinic,
    assignedDoctorIds: user.assignedDoctorIds,
  }
}

// Issues a fresh access+refresh pair, stores the refresh token's hash on
// the user, and sets it as an httpOnly cookie. Shared by register/login/refresh.
async function issueSession(user, res) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  user.refreshTokenHash = hashToken(refreshToken)
  user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await user.save()

  res.cookie('refreshToken', refreshToken, refreshCookieOptions())
  return accessToken
}

// POST /api/clinic/auth/register
export const register = asyncHandler(async (req, res) => {
  const { clinicName, ownerName, email, password, address } = req.body

  const existing = await ClinicUser.findOne({ email })
  if (existing) throw new ApiError(409, 'An account with this email already exists')

  const session = await mongoose.startSession()
  let user
  try {
    await session.withTransaction(async () => {
      const [clinic] = await Clinic.create([{ name: clinicName, address }], { session })
      const passwordHash = await hashPassword(password)
      ;[user] = await ClinicUser.create(
        [{ clinic: clinic._id, name: ownerName, email, passwordHash, role: 'owner' }],
        { session }
      )
    })
  } finally {
    session.endSession()
  }

  const accessToken = await issueSession(user, res)
  res.status(201).json({ accessToken, user: publicUser(user) })
})

// POST /api/clinic/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await ClinicUser.findOne({ email: email.toLowerCase().trim() })
  if (!user) throw new ApiError(401, 'Invalid email or password')

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw new ApiError(401, 'Invalid email or password')

  const accessToken = await issueSession(user, res)
  res.json({ accessToken, user: publicUser(user) })
})

// POST /api/clinic/auth/refresh
// Reads the refresh cookie, checks it against the hash stored on the user,
// and — if valid — issues a brand new access+refresh pair (rotation: the
// old refresh token becomes useless the moment a new one is issued, so a
// stolen-but-unused refresh token has a shrinking window of usefulness).
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) throw new ApiError(401, 'Not authenticated')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please log in again')
  }

  const user = await ClinicUser.findById(payload.sub).select('+refreshTokenHash +refreshTokenExpiresAt')
  if (!user || !user.refreshTokenHash) throw new ApiError(401, 'Session expired, please log in again')

  const isCurrentToken = user.refreshTokenHash === hashToken(token)
  const notExpired = user.refreshTokenExpiresAt && user.refreshTokenExpiresAt > new Date()
  if (!isCurrentToken || !notExpired) {
    throw new ApiError(401, 'Session expired, please log in again')
  }

  const accessToken = await issueSession(user, res) // rotates refresh token too
  res.json({ accessToken, user: publicUser(user) })
})

// POST /api/clinic/auth/logout
// Real revocation: deletes the stored hash so the refresh token in the
// cookie (even if an attacker still has a copy of it) can never be
// exchanged for a new access token again — not just "client forgets it".
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await ClinicUser.findByIdAndUpdate(payload.sub, {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      })
    } catch {
      // token already invalid/expired — nothing to revoke, fall through
    }
  }
  res.clearCookie('refreshToken', { path: '/api/clinic/auth' })
  res.json({ message: 'Logged out' })
})

// GET /api/clinic/auth/me — restores session on page refresh
export const me = asyncHandler(async (req, res) => {
  res.json(publicUser(req.clinicUser))
})

// POST /api/clinic/auth/staff — owner only, add an operator account
export const addStaff = asyncHandler(async (req, res) => {
  const { name, email, password, assignedDoctorIds } = req.body

  const existing = await ClinicUser.findOne({ email })
  if (existing) throw new ApiError(409, 'An account with this email already exists')

  const passwordHash = await hashPassword(password)
  const user = await ClinicUser.create({
    clinic: req.clinicUser.clinic,
    name,
    email,
    passwordHash,
    role: 'operator',
    assignedDoctorIds,
  })

  res.status(201).json({
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    assignedDoctorIds: user.assignedDoctorIds,
  })
})
