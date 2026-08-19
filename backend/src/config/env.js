import 'dotenv/config'
import { z } from 'zod'

// Fail fast on boot if a required env var is missing/malformed, instead of
// discovering it later as a confusing runtime error (e.g. "secretOrPrivateKey
// must have a value" from jsonwebtoken).
const schema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  ACCESS_TOKEN_SECRET: z.string().min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),

  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  REFRESH_TOKEN_EXPIRES_IN_MS: z.coerce.number().default(30 * 24 * 60 * 60 * 1000),

  COOKIE_SECURE: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
