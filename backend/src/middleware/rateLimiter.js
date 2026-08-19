// Minimal in-memory limiter (fine for a single-instance deployment; swap
// for a Redis-backed one, e.g. `rate-limiter-flexible`, once you run more
// than one server process). Prevents a script from hammering the public
// booking endpoint and burning through the 30-slot cap in seconds.
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10
const hits = new Map()

export function publicBookingLimiter(req, res, next) {
  const key = req.ip
  const now = Date.now()
  const record = hits.get(key) || { count: 0, resetAt: now + WINDOW_MS }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + WINDOW_MS
  }

  record.count += 1
  hits.set(key, record)

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many booking attempts — please slow down.' })
  }
  next()
}

// Stricter limiter for login specifically — keyed by IP + the email being
// attempted, not just IP. This stops an attacker from brute-forcing ONE
// known email address by rotating IPs slower than the window, while not
// penalizing a shared office/clinic IP where several different staff
// members are legitimately logging into different accounts.
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const loginHits = new Map()

export function loginLimiter(req, res, next) {
  const email = (req.body?.email || '').toLowerCase().trim()
  const key = `${req.ip}:${email}`
  const now = Date.now()
  const record = loginHits.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + LOGIN_WINDOW_MS
  }

  record.count += 1
  loginHits.set(key, record)

  if (record.count > MAX_LOGIN_ATTEMPTS) {
    const waitMin = Math.ceil((record.resetAt - now) / 60000)
    return res
      .status(429)
      .json({ message: `Too many login attempts. Try again in ${waitMin} minute(s).` })
  }
  next()
}
