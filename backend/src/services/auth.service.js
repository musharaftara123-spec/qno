import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env.js'

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

// --- Access token (short-lived, sent in Authorization header) ---
export function signAccessToken(clinicUser) {
  return jwt.sign(
    {
      sub: clinicUser._id.toString(),
      clinicId: clinicUser.clinic.toString(),
      role: clinicUser.role,
      type: 'access',
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  )
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET)
  if (payload.type !== 'access') throw new Error('Wrong token type')
  return payload
}

// --- Refresh token (long-lived, httpOnly cookie only, never in JS) ---
// The token itself is only ever held by the client (in the cookie) and is
// never stored server-side in plaintext — only its SHA-256 hash is, same
// principle as bcrypt-hashing passwords. This means:
//   1. A DB leak alone can't be replayed as a working refresh token.
//   2. Logout can genuinely revoke access (delete the stored hash) instead
//      of just deleting a cookie the client could ignore.
export function signRefreshToken(clinicUser) {
  return jwt.sign(
    { sub: clinicUser._id.toString(), type: 'refresh' },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  )
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET)
  if (payload.type !== 'refresh') throw new Error('Wrong token type')
  return payload
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE, // true in production (HTTPS only)
    sameSite: 'strict',
    path: '/api/clinic/auth', // only sent to auth endpoints, not every request
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN_MS,
  }
}
