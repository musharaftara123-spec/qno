import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  ChevronDown,
  Volume2,
  Users,
  Clock3,
  CheckCircle2,
  UserX,
  ArrowRight,
  Undo2,
  SkipForward,
  PauseCircle,
  PlayCircle,
  Square,
  Bell,
  Info,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { mockClinicQueues } from '../../services/clinicMockData.js'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'

const STAT_ICONS = {
  waiting: Users,
  avgWait: Clock3,
  served: CheckCircle2,
  noShow: UserX,
}

// Builds the live, mutable queue state for one doctor from the static mock
// data. Each doctor's state (and undo history) is independent, matching
// "operating one queue must never affect another doctor's queue".
function buildInitialQueueState(doctorId) {
  const base = mockClinicQueues[doctorId]
  return {
    doctorName: base.doctorName,
    specialty: base.specialty,
    avgWaitMin: base.avgWaitMin,
    currentToken: base.currentToken,
    waitingList: base.waitingList,
    waiting: base.waiting,
    servedToday: base.servedToday,
    noShowToday: base.noShowToday,
    isHeld: false,
    isEnded: false,
    history: [], // stack of previous snapshots, for multi-level Undo
  }
}

function snapshot(state) {
  // Shallow-ish clone of everything Undo needs to restore
  return {
    currentToken: state.currentToken,
    waitingList: state.waitingList,
    waiting: state.waiting,
    servedToday: state.servedToday,
    noShowToday: state.noShowToday,
  }
}

export default function QueueManagement() {
  const { user } = useClinicAuth()
  const isOwner = user?.role === 'owner'
  const doctorIds = Object.keys(mockClinicQueues)

  const assignedIds = user?.assignedDoctorIds || doctorIds
  const availableIds = isOwner ? doctorIds : assignedIds
  const showSelector = isOwner || availableIds.length > 1

  const [selectedDoctorId, setSelectedDoctorId] = useState(availableIds[0])
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Per-doctor live state, lazily initialized on first visit to that doctor
  const [queueStates, setQueueStates] = useState(() => ({
    [availableIds[0]]: buildInitialQueueState(availableIds[0]),
  }))

  const queue =
    queueStates[selectedDoctorId] || buildInitialQueueState(selectedDoctorId)

  const updateQueue = (updater) => {
    setQueueStates((prev) => ({
      ...prev,
      [selectedDoctorId]: updater(prev[selectedDoctorId] || buildInitialQueueState(selectedDoctorId)),
    }))
  }

  const handleSelectDoctor = (id) => {
    setSelectedDoctorId(id)
    setQueueStates((prev) =>
      prev[id] ? prev : { ...prev, [id]: buildInitialQueueState(id) }
    )
  }

  const handleNext = () => {
    if (queue.isEnded) return
    if (queue.isHeld) {
      toast.error('Queue is on hold. Resume to continue.')
      return
    }
    if (queue.waitingList.length === 0) {
      toast.error('No patients waiting.')
      return
    }

    updateQueue((q) => {
      const [next, ...rest] = q.waitingList
      return {
        ...q,
        history: [...q.history, snapshot(q)],
        currentToken: {
          token: next.token,
          patientName: next.patientName,
          status: 'In Progress',
        },
        waitingList: rest,
        waiting: rest.length,
        servedToday: q.servedToday + 1, // previous patient counted as served
      }
    })
  }

  const handleSkip = () => {
    if (queue.isEnded) return
    if (queue.isHeld) {
      toast.error('Queue is on hold. Resume to continue.')
      return
    }
    if (queue.waitingList.length === 0) {
      toast.error('No patients waiting.')
      return
    }

    updateQueue((q) => {
      const [next, ...rest] = q.waitingList
      return {
        ...q,
        history: [...q.history, snapshot(q)],
        currentToken: {
          token: next.token,
          patientName: next.patientName,
          status: 'In Progress',
        },
        waitingList: rest,
        waiting: rest.length,
        noShowToday: q.noShowToday + 1, // previous patient marked as no-show
      }
    })
    toast.success('Patient skipped')
  }

  const handleUndo = () => {
    if (queue.history.length === 0) {
      toast.error('Nothing to undo.')
      return
    }
    updateQueue((q) => {
      const prevSnapshot = q.history[q.history.length - 1]
      return {
        ...q,
        ...prevSnapshot,
        history: q.history.slice(0, -1),
      }
    })
  }

  const handleToggleHold = () => {
    updateQueue((q) => ({ ...q, isHeld: !q.isHeld }))
  }

  const handleEndQueue = () => {
    if (queue.isEnded) return
    const confirmed = window.confirm(
      `End today's queue for ${queue.doctorName}? This cannot be undone.`
    )
    if (!confirmed) return
    updateQueue((q) => ({ ...q, isEnded: true, isHeld: false }))
    toast.success('Queue ended for today')
  }

  const stats = [
    { key: 'waiting', label: 'Waiting', value: queue.waiting, color: 'text-gray-800 dark:text-gray-100' },
    { key: 'avgWait', label: 'Avg. Wait Time', value: `${queue.avgWaitMin} min`, color: 'text-gray-800 dark:text-gray-100' },
    { key: 'served', label: 'Served Today', value: queue.servedToday, color: 'text-green-600 dark:text-green-400' },
    { key: 'noShow', label: 'No Show Today', value: queue.noShowToday, color: 'text-red-500 dark:text-red-400' },
  ]

  return (
    <ClinicDashboardLayout
      headerRight={{
        title: (
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Queue Management
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Manage your clinic queue in real-time
            </p>
          </div>
        ),
        right: (
          <>
            {showSelector && (
              <DoctorSelector
                doctorIds={availableIds}
                selectedDoctorId={selectedDoctorId}
                onSelect={handleSelectDoctor}
                open={selectorOpen}
                setOpen={setSelectorOpen}
              />
            )}
            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 relative"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
          </>
        ),
      }}
    >
      {/* Mobile header + selector */}
      <div className="lg:hidden mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Queue Management</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Manage your clinic queue in real-time
        </p>
        {showSelector && (
          <DoctorSelector
            doctorIds={availableIds}
            selectedDoctorId={selectedDoctorId}
            onSelect={handleSelectDoctor}
            open={selectorOpen}
            setOpen={setSelectorOpen}
            fullWidth
          />
        )}
      </div>

      {(queue.isHeld || queue.isEnded) && (
        <div
          className={`rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5 text-sm font-medium ${
            queue.isEnded
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
          }`}
        >
          <Info size={16} className="shrink-0" />
          {queue.isEnded
            ? "This queue has ended for today."
            : 'Queue is on hold — patients are not being called.'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Current Token */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Current Token
            </p>
            <Volume2 size={16} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-4xl font-extrabold text-brand-600 dark:text-brand-400 mb-1">
            {queue.currentToken.token}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {queue.currentToken.patientName}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {queue.currentToken.status}
          </span>
        </div>

        {/* Queue Summary */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            Queue Summary
          </p>
          <div className="grid grid-cols-4 gap-2">
            {stats.map((s) => {
              const Icon = STAT_ICONS[s.key]
              return (
                <div key={s.key} className="text-center">
                  <div className="w-9 h-9 mx-auto mb-1.5 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <Icon size={16} className={s.color} />
                  </div>
                  <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                    {s.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Waiting List */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Waiting List
          </p>
          {queue.waitingList.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No patients waiting.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    <th className="font-medium py-2 px-1 w-8">#</th>
                    <th className="font-medium py-2 px-1">Token</th>
                    <th className="font-medium py-2 px-1">Patient Name</th>
                    <th className="font-medium py-2 px-1 text-right">Wait Time</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.waitingList.map((row, i) => (
                    <tr key={row.token} className="border-t border-gray-50 dark:border-gray-800">
                      <td className="py-2.5 px-1 text-gray-400">{i + 1}</td>
                      <td className="py-2.5 px-1">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {row.token}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {row.patientName}
                      </td>
                      <td className="py-2.5 px-1 text-right text-gray-500 dark:text-gray-400">
                        {row.waitMin} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Quick Actions
          </p>
          <div className="space-y-2.5">
            <button
              onClick={handleNext}
              disabled={queue.isEnded || queue.isHeld}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white transition-colors"
            >
              Next Token
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleUndo}
              disabled={queue.history.length === 0}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:disabled:bg-gray-800/50 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Undo2 size={16} />
                Undo
              </span>
              {queue.history.length > 0 && (
                <span className="text-xs bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full">
                  {queue.history.length}
                </span>
              )}
            </button>

            <ActionButton icon={SkipForward} label="Skip Token" tone="blue" onClick={handleSkip} disabled={queue.isEnded || queue.isHeld} />
            <ActionButton
              icon={queue.isHeld ? PlayCircle : PauseCircle}
              label={queue.isHeld ? 'Resume Queue' : 'Hold Queue'}
              tone="orange"
              onClick={handleToggleHold}
              disabled={queue.isEnded}
            />
            <ActionButton icon={Square} label="End Queue" tone="red" onClick={handleEndQueue} disabled={queue.isEnded} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-50 dark:bg-gray-800/60 border border-brand-100 dark:border-gray-700 px-4 py-3 flex items-center gap-2.5">
        <Info size={16} className="text-brand-500 dark:text-brand-400 shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Tip: Pressed Next Token by mistake? Undo reverses it — press it multiple times to go back further.
        </p>
      </div>
    </ClinicDashboardLayout>
  )
}

function DoctorSelector({ doctorIds, selectedDoctorId, onSelect, open, setOpen, fullWidth }) {
  const selected = mockClinicQueues[selectedDoctorId]

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 ${
          fullWidth ? 'w-full justify-between' : ''
        }`}
      >
        <span className="truncate">
          {selected.doctorName} — {selected.specialty}
        </span>
        <ChevronDown size={15} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft z-20 overflow-hidden">
            {doctorIds.map((id) => {
              const doc = mockClinicQueues[id]
              const isSelected = id === selectedDoctorId
              return (
                <button
                  key={id}
                  onClick={() => {
                    onSelect(id)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="truncate">{doc.doctorName}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {doc.waiting} waiting
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const ACTION_TONES = {
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300',
  orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300',
  red: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400',
}

function ActionButton({ icon: Icon, label, tone, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${ACTION_TONES[tone]}`}
    >
      <Icon size={17} />
      {label}
    </button>
  )
}