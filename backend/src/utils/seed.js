// Seeds the DB with the same clinics/doctors/owner account already in
// frontend/src/services/mockData.js + clinicMockData.js, so you can test
// against the real backend without re-entering everything by hand.
//
// Run with: npm run seed

import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { hashPassword } from '../services/auth.service.js'
import Clinic from '../models/Clinic.js'
import ClinicUser from '../models/ClinicUser.js'
import Doctor from '../models/Doctor.js'
import mongoose from 'mongoose'

async function seed() {
  await connectDB()

  await Promise.all([
    Clinic.deleteMany({}),
    ClinicUser.deleteMany({}),
    Doctor.deleteMany({}),
  ])

  const clinic = await Clinic.create({
    name: 'Sunrise Family Clinic',
    category: 'General Clinic',
    address: '123, Main Street, Sopore, Jammu & Kashmir 193201',
    isOpen: true,
    rating: 4.6,
    reviewCount: 128,
    timings: 'Mon - Sat · 9:00 AM - 8:00 PM',
    consultationFee: 500,
    facilities: ['Digital Queue', 'Online Payment', 'Waiting Lounge', 'Parking'],
    about: 'Modern clinic with experienced doctors and advanced facilities.',
  })

  const passwordHash = await hashPassword('12345')
  await ClinicUser.create({
    clinic: clinic._id,
    name: 'Dr. Owner Name',
    email: 'owner@clinic.test',
    passwordHash,
    role: 'owner',
  })

  await Doctor.create([
    {
      clinic: clinic._id,
      name: 'Dr. Adil Rashid',
      qualification: 'MBBS, MD',
      specialty: 'General Physician',
      rating: 4.8,
      fee: 500,
      availability: [
        { day: 'Tuesday', start: '4:00 PM', end: '6:00 PM' },
        { day: 'Wednesday', start: '8:00 AM', end: '10:00 AM' },
        { day: 'Friday', start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      clinic: clinic._id,
      name: 'Dr. Sana Khan',
      qualification: 'MBBS, DNB (Gynecologist)',
      specialty: 'Gynecologist',
      rating: 4.7,
      fee: 600,
      availability: [
        { day: 'Monday', start: '10:00 AM', end: '1:00 PM' },
        { day: 'Thursday', start: '12:00 PM', end: '3:00 PM' },
      ],
    },
  ])

  console.log('✅ Seeded: 1 clinic, 1 owner login (owner@clinic.test / 12345), 2 doctors')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
