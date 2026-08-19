# QNO Backend

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, ACCESS_TOKEN_SECRET, and REFRESH_TOKEN_SECRET
# (generate each separately: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
npm run seed   # optional — loads sample clinic/doctors/owner login
npm run dev
```

Server starts on `http://localhost:5000` (or whatever `PORT` you set).
Health check: `GET /health`.

## Wiring up the frontend

In `frontend/.env`, set:
```
VITE_USE_MOCKS=false
```
and point axios's `baseURL` (in `src/services/api.js`) at this server, e.g.
via a Vite proxy or `VITE_API_URL=http://localhost:5000/api`.

**Required for auth to work**: the refresh token is delivered as an
httpOnly cookie, so the axios instance must send/accept cookies cross-origin:
```js
const api = axios.create({ baseURL: '/api', withCredentials: true })
```
Without `withCredentials: true`, login will appear to succeed (you get an
access token back) but `/api/clinic/auth/refresh` will silently fail once
the access token expires (15 min), since the browser won't have sent the
refresh cookie.

Store the returned `accessToken` in memory (e.g. React state/context) —
**not** `localStorage`/`sessionStorage` — and attach it as
`Authorization: Bearer <token>` on requests. On a 401, call
`POST /api/clinic/auth/refresh` (cookie sent automatically) to get a new
access token, then retry the original request once.

No other frontend changes should be needed — every route here returns the
same shape the mock adapter in `api.js` already returns.

## Seeded login (if you ran `npm run seed`)

```
email:    owner@clinic.test
password: 12345
```

## Notes / things to decide before production

- **Payments**: `POST /api/appointments/:id/pay` just flips status to
  `confirmed` — wire in a real gateway (Razorpay/Stripe) before relying on it.
- **Email/OTP** for `ClinicRegister.jsx`'s verification step isn't
  implemented yet — register currently creates the account immediately.
  Add an OTP service (e.g. via nodemailer + a short-lived code in Redis or
  a `otpHash`/`otpExpiresAt` field on ClinicUser) if you want that gate.
- **Rate limiting** is in-memory (`rateLimiter.js`) — fine for one server
  instance; swap to a Redis-backed limiter if you scale horizontally.
- **CORS_ORIGIN** in `.env` must exactly match your deployed frontend URL(s)
  exactly (no wildcard — required for `credentials: true` to work).
- **Refresh token storage**: currently one active refresh token per user
  (a new login/refresh overwrites the old hash). If you want multi-device
  login (phone + laptop both staying logged in), move `refreshTokenHash`/
  `refreshTokenExpiresAt` into a separate `RefreshToken` collection keyed
  by device/session instead of fields directly on `ClinicUser`.

