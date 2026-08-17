import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Stethoscope,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  ChevronDown,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'

const STAT_CARDS = [
  {
    key: 'patients',
    label: "Today's Patients",
    value: 28,
    trend: '+12% from yesterday',
    trendUp: true,
    icon: Users,
    tone: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
  },
  {
    key: 'queue',
    label: 'Current Queue',
    value: 18,
    sub: 'Waiting',
    trend: '+5 from yesterday',
    trendUp: true,
    icon: UserCheck,
    tone: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    key: 'doctors',
    label: 'Doctors',
    value: 6,
    sub: 'Active',
    trend: '1 on leave today',
    neutral: true,
    icon: Stethoscope,
    tone: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    key: 'wait',
    label: 'Avg. Wait Time',
    value: '18 mins',
    trend: '5 mins from yesterday',
    trendUp: false,
    icon: Clock3,
    tone: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
]

const APPOINTMENTS = [
  { time: '09:00 AM', patient: 'Bilal Ahmad', doctor: 'Dr. Adil Rashid', status: 'Completed' },
  { time: '09:20 AM', patient: 'Musharaf Tara', doctor: 'Dr. Adil Rashid', status: 'Waiting' },
  { time: '09:40 AM', patient: 'Aisha Khan', doctor: 'Dr. Sana Khan', status: 'Waiting' },
  { time: '10:00 AM', patient: 'Irfan Lone', doctor: 'Dr. Imran Nazir', status: 'Upcoming' },
  { time: '10:20 AM', patient: 'Zainab Dar', doctor: 'Dr. Sana Khan', status: 'Upcoming' },
]

const STATUS_STYLES = {
  Completed: { dot: 'bg-green-500', pill: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  Waiting: { dot: 'bg-orange-400', pill: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  Upcoming: { dot: 'bg-blue-400', pill: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

export default function ClinicDashboard() {
  const { user } = useClinicAuth()
  const firstName = (user?.name || 'Doctor').split(' ')[0]

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Good Morning, {firstName} 👋
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Here's what's happening at your clinic today.
            </p>
          </div>
        ),
        right: (
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
            <CalendarDays size={15} className="text-gray-400" />
            {today}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        ),
      }}
    >
      {/* Mobile header (desktop shows this in the top bar) */}
      <div className="lg:hidden mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Good Morning, {firstName} 👋
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Here's what's happening at your clinic today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-4"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.tone}`}>
              <card.icon size={17} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
              {card.value}
              {card.sub && (
                <span className="text-xs font-medium text-gray-400 ml-1">{card.sub}</span>
              )}
            </p>
            <p
              className={`flex items-center gap-1 text-[11px] font-medium mt-1.5 ${
                card.neutral ? 'text-gray-400' : 'text-green-600 dark:text-green-400'
              }`}
            >
              {!card.neutral &&
                (card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
              {card.trend}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Today's Appointments
          </p>
          <button className="text-xs font-medium text-brand-600 dark:text-brand-400">
            View All
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {APPOINTMENTS.map((appt, i) => {
            const style = STATUS_STYLES[appt.status]
            return (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span className="text-xs text-gray-400 w-16 shrink-0">{appt.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {appt.patient}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Consultation with {appt.doctor}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${style.pill}`}
                >
                  {appt.status}
                </span>
              </div>
            )
          })}
        </div>

        <button className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          View All Appointments
        </button>
      </div>
    </ClinicDashboardLayout>
  )
}