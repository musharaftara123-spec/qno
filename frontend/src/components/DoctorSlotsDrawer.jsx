import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Phone, IndianRupee, Clock, Trash2, Plus } from 'lucide-react'
import { WEEKDAY_ORDER } from '../../services/clinicMockData.js'

function sortByWeekday(sessions, fromToday = false) {
  const list = [...(sessions || [])]
  if (!fromToday) {
    return list.sort((a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day))
  }
  const todayIdx = WEEKDAY_ORDER.indexOf(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  return list.sort((a, b) => {
    const ai = (WEEKDAY_ORDER.indexOf(a.day) - todayIdx + 7) % 7
    const bi = (WEEKDAY_ORDER.indexOf(b.day) - todayIdx + 7) % 7
    return ai - bi
  })
}

function getNextAvailableSession(availability = []) {
  const ordered = sortByWeekday(availability, true)
  return ordered.find((s) => (s.bookedSlots || 0) < (s.totalSlots || 0)) || null
}

function weeklyTotals(availability = []) {
  const totalSlots = availability.reduce((sum, s) => sum + (Number(s.totalSlots) || 0), 0)
  const bookedSlots = availability.reduce((sum, s) => sum + (Number(s.bookedSlots) || 0), 0)
  const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0
  return { totalSlots, bookedSlots, occupancy }
}

export default function DoctorSlotsDrawer({ doctor, onClose, onSave }) {
  const [sessions, setSessions] = useState(() =>
    sortByWeekday(doctor.availability || []).map((s, i) => ({
      ...s,
      totalSlots: s.totalSlots ?? doctor.totalSlots ?? 10,
      bookedSlots: s.bookedSlots ?? 0,
      _key: `${doctor._id || doctor.id}_${i}_${Date.now()}`,
    }))
  )

  if (!doctor) return null

  const { totalSlots, bookedSlots, occupancy } = weeklyTotals(sessions)
  const nextAvailable = getNextAvailableSession(sessions)

  const updateSession = (key, field, value) => {
    setSessions((prev) =>
      prev.map((s) =>
        s._key === key
          ? {
              ...s,
              [field]:
                field === 'totalSlots' || field === 'bookedSlots'
                  ? value === '' ? '' : Number(value)
                  : value,
            }
          : s
      )
    )
  }

  const removeSession = (key) => setSessions((prev) => prev.filter((s) => s._key !== key))

  const addSession = () =>
    setSessions((prev) => [
      ...prev,
      {
        day: 'Monday',
        start: '9:00 AM',
        end: '12:00 PM',
        totalSlots: 10,
        bookedSlots: 0,
        _key: `new_${Date.now()}_${Math.random()}`,
      },
    ])

  const handleSave = () => {
    const clean = sessions.map(({ _key, ...rest }) => ({
      ...rest,
      totalSlots: rest.totalSlots === '' ? 0 : Number(rest.totalSlots) || 0,
      bookedSlots: rest.bookedSlots === '' ? 0 : Number(rest.bookedSlots) || 0,
    }))
    onSave(doctor._id || doctor.id, clean)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{doctor.name}</p>
            <p className="text-xs text-gray-400">
              {doctor.specialty}
              {doctor.qualification ? ` · ${doctor.qualification}` : ''} · Weekly slots
            </p>
            {(doctor.phone || doctor.fee != null) && (
              <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                {doctor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {doctor.phone}
                  </span>
                )}
                {doctor.fee != null && (
                  <span className="flex items-center gap-1">
                    <IndianRupee size={11} /> {doctor.fee} / visit
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Weekly Capacity</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{totalSlots} slots</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Booked / Occupancy</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {bookedSlots} · {occupancy}%
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
            <p className="text-[10px] text-gray-400">Next Available</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {nextAvailable ? `${nextAvailable.day.slice(0, 3)}, ${nextAvailable.start}` : 'Fully booked'}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">
              No weekly sessions set yet. Add one below to start building this doctor's schedule.
            </p>
          ) : (
            sessions.map((s) => {
              const currentTotal = Number(s.totalSlots) || 0
              const currentBooked = Number(s.bookedSlots) || 0
              const full = currentBooked >= currentTotal && currentTotal > 0
              const pct = currentTotal > 0 ? Math.min(100, Math.round((currentBooked / currentTotal) * 100)) : 0

              return (
                <div key={s._key} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={s.day}
                      onChange={(e) => updateSession(s._key, 'day', e.target.value)}
                      className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    >
                      {WEEKDAY_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                    </div>
                    <input
                      value={s.start}
                      onChange={(e) => updateSession(s._key, 'start', e.target.value)}
                      placeholder="Start (e.g. 9:00 AM)"
                      className="h-8 w-28 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    />
                    <span className="text-xs text-gray-400">–</span>
                    <input
                      value={s.end}
                      onChange={(e) => updateSession(s._key, 'end', e.target.value)}
                      placeholder="End (e.g. 12:00 PM)"
                      className="h-8 w-28 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    />
                    <div className="flex items-center gap-1 ml-auto">
                      <label className="text-[10px] text-gray-400">Slots</label>
                      <input
                        type="number"
                        min={0}
                        value={s.totalSlots ?? ''}
                        onChange={(e) => updateSession(s._key, 'totalSlots', e.target.value)}
                        className="h-8 w-16 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      onClick={() => removeSession(s._key)}
                      title="Remove session"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${full ? 'bg-red-400' : 'bg-brand-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${full ? 'text-red-500' : 'text-gray-400'}`}>
                      {currentBooked}/{currentTotal} booked today
                    </span>
                  </div>
                </div>
              )
            })
          )}

          <button
            onClick={addSession}
            className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={14} />
            Add Session
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Save Schedule
          </button>
        </div>
      </motion.div>
    </div>
  )
}