import { z } from 'zod'

const availabilitySlotSchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  start: z.string().trim().min(1),
  end: z.string().trim().min(1),
  totalSlots: z.coerce.number().int().min(0).default(0),
  bookedSlots: z.coerce.number().int().min(0).default(0),
})

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2),
  qualification: z.string().optional(),
  specialty: z.string().trim().min(2),
  fee: z.number().nonnegative(),
  availability: z.array(availabilitySlotSchema).default([]),
})

export const updateDoctorSchema = createDoctorSchema.partial().extend({
  active: z.boolean().optional(),
})