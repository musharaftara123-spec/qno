import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Clock, CalendarCheck, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/my-queue', label: 'My Queue', icon: Clock },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function BottomTabBar() {
  return (
    <nav className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] shrink-0">
      <div className="flex items-stretch justify-around px-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={isActive ? 'opacity-100' : 'opacity-80'}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}