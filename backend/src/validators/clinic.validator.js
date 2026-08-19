import { z } from 'zod'

export const registerClinicSchema = z.object({
  clinicName: z.string().trim().min(2),
  ownerName: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().trim().min(5),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  category: z.string().optional(),
  about: z.string().optional(),
  address: z.string().optional(),
  timings: z.string().optional(),
  consultationFee: z.number().nonnegative().optional(),
  isOpen: z.boolean().optional(),
  facilities: z.array(z.string()).optional(),
})
