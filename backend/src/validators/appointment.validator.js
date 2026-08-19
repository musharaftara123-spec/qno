import { z } from 'zod'

export const bookAppointmentSchema = z.object({
  clinicId: z.string().min(1),
  doctorId: z.string().min(1),
  patientName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  patientPhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),
  patientAge: z.number().int().positive().lt(120),
  patientGender: z.enum(['Male', 'Female', 'Other']),
  purpose: z.string().optional(),
  slotDay: z.string().min(1, 'Please select a session'),
  appointmentDate: z.string().min(1),
})

export const receptionistAppointmentSchema = bookAppointmentSchema.omit({ clinicId: true })
