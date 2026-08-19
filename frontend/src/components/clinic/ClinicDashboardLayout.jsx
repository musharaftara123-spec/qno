import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  ListOrdered,
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Stethoscope,
  Settings,
  ChevronDown,
  Menu,
  X,
  Bell,
  MoreHorizontal,
  LogOut,
} from 'lucide-react'
import { mockClinicInfo } from '../../services/clinicMockData.js'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'

// Full nav for Clinic Owner. Operators only ever see 'Queue Management',
// plus Appointments/Patients if you want them to — Settings and Doctors
// are owner-only per the role rules.
const NAV_ITEMS = [
  { to: '/clinic/queue', label: 'Queue Management', icon: ListOrdered, ownerOnly: false },
  // { to: '/clinic/dashboard', label: 'Dashboard', icon: LayoutDashboard, ownerOnly: true },
  { to: '/clinic/doctors', label: 'Doctors', icon: Stethoscope, ownerOnly: true },
  { to: '/clinic/appointments', label: 'Appointments', icon: CalendarCheck2, ownerOnly: true },
  { to: '/clinic/patients', label: 'Patients', icon: Users, ownerOnly: true },
  { to: '/clinic/settings', label: 'Settings', icon: Settings, ownerOnly: true },
]

// Trimmed set shown in the mobile bottom bar (5 max, per your spec)
const MOBILE_NAV_ITEMS = [
  { to: '/clinic/dashboard', label: 'Dashboard', icon: LayoutDashboard, ownerOnly: true },
  { to: '/clinic/queue', label: 'Queue', icon: ListOrdered, ownerOnly: false },
  { to: '/clinic/appointments', label: 'Appointments', icon: CalendarCheck2, ownerOnly: false },
  { to: '/clinic/patients', label: 'Patients', icon: Users, ownerOnly: false },
  { to: '/clinic/more', label: 'More', icon: MoreHorizontal, ownerOnly: false },
]

export default function ClinicDashboardLayout({ children, headerRight }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useClinicAuth()
  const navigate = useNavigate()
  const isOwner = user?.role === 'owner'

  const handleLogout = () => {
    logout()
    navigate('/clinic-login')
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => isOwner || !item.ownerOnly)
  const visibleMobileItems = MOBILE_NAV_ITEMS.filter((item) => isOwner || !item.ownerOnly)

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-surface-dark flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen sticky top-0">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
              Q
            </span>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white">Qno</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Clinic Portal
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
            {mockClinicInfo.name}
            <ChevronDown size={15} className="text-gray-400" />
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
            <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-xs shrink-0">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {user?.name}
              </span>
              <span className="block text-[11px] text-gray-400 capitalize">
                {isOwner ? 'Clinic Owner' : 'Queue Operator'}
              </span>
            </span>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile slide-in menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white dark:bg-gray-900 h-full p-4 pt-[calc(env(safe-area-inset-top)+1rem)] shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
                  Q
                </span>
                <span className="font-extrabold text-lg">Qno</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <nav className="space-y-1">
              {visibleNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-[10px]">
              Q
            </span>
            <span className="font-bold text-sm">Qno</span>
          </div>
          <button aria-label="Notifications" className="relative">
            <Bell size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
          <div>{headerRight?.title}</div>
          <div className="flex items-center gap-4">{headerRight?.right}</div>
        </header>

        <main className="flex-1 px-4 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] lg:pb-8 pt-2">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-stretch justify-around px-1">
            {visibleMobileItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}