import React from 'react'
import { motion } from 'framer-motion'

/**
 * Mobile-first shell for the Patient App.
 * - Full-width, single-column on phones (the primary use case).
 * - Caps to a centered card-like width on larger screens instead of stretching.
 * - Respects safe areas for notches / home indicators.
 * - Sticky header stays reachable, content scrolls beneath it.
 */
export default function MobileLayout({ title, subtitle, headerRight, children }) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-surface-dark sm:bg-gradient-to-br sm:from-brand-50 sm:via-gray-50 sm:to-brand-100 dark:sm:from-gray-950 dark:sm:via-surface-dark dark:sm:to-gray-900 flex justify-center sm:items-center sm:py-10">
      <div className="w-full sm:max-w-md md:max-w-lg flex flex-col min-h-screen min-h-[100dvh] sm:min-h-[42rem] sm:max-h-[46rem] bg-white dark:bg-gray-900 sm:rounded-3xl overflow-hidden shadow-none sm:shadow-soft dark:sm:shadow-softDark sm:border sm:border-gray-100 dark:sm:border-gray-800">
        <header
          className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-4 pb-3 flex items-center justify-between shrink-0"
        >
          <div>
            {title && (
              <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}