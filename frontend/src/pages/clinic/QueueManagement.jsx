import React, { useEffect, useMemo, useState } from 'react'
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
  Search,
  X,
  Loader2,
} from 'lucide-react'
import ClinicDashboardLayout from '../../components/clinic/ClinicDashboardLayout.jsx'
import { useClinicAuth } from '../../contexts/ClinicAuthContext.jsx'
import api from '../../services/api.js'

const STAT_ICONS = {
  waiting: Users,
  avgWait: Clock3,
  served: CheckCircle2,
  noShow: UserX,
}

function buildInitialQueueState(doctor) {
  return {
    doctorId: doctor?._id || doctor?.id || '',
    doctorName: doctor?.name || doctor?.doctorName || 'Doctor',
    specialty: doctor?.specialty || '',
    avgWaitMin: doctor?.avgWaitMin || 15,
    avgConsultationMin: doctor?.avgConsultationMin || 12,
    currentToken: { token: '---', patientName: 'N/A', status: 'Idle' },
    waitingList: [],
    waiting: 0,
    servedToday: 0,
    noShowToday: 0,
    isHeld: false,
    isEnded: false,
    history: [], // Stack of snapshots for client-side Undo
  }
}

function snapshot(state) {
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

  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingQueue, setLoadingQueue] = useState(false)

  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [queueStates, setQueueStates] = useState({})

  // Keep live clock updated every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // 1. Load Doctors from backend
  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoadingDoctors(true)
        const response = await api.get('/clinic/doctors')
        const docList = response.data.doctors || response.data || []
        setDoctors(docList)

        // Determine accessible doctor IDs based on user permissions
        const allIds = docList.map((d) => d._id || d.id)
        const assigned = user?.assignedDoctorIds?.length
          ? user.assignedDoctorIds
          : allIds
        const available = isOwner ? allIds : assigned

        if (available.length > 0) {
          setSelectedDoctorId(available[0])
        }
      } catch (error) {
        console.error('Failed to load doctors:', error)
        toast.error(error.message || 'Failed to load doctors list')
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [user, isOwner])

  // Filter available doctors according to user role
  const availableDoctors = useMemo(() => {
    const allIds = doctors.map((d) => d._id || d.id)
    const assigned = user?.assignedDoctorIds?.length
      ? user.assignedDoctorIds
      : allIds
    const availableIds = isOwner ? allIds : assigned

    return doctors.filter((doc) => availableIds.includes(doc._id || doc.id))
  }, [doctors, user, isOwner])

  const showSelector = isOwner || availableDoctors.length > 1

  // 2. Fetch live Queue details when active doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return

    async function loadQueueData(doctorId) {
      try {
        setLoadingQueue(true)
        const response = await api.get(`/clinic/doctors/${doctorId}/queue`)
        const data = response.data || {}

        setQueueStates((prev) => ({
          ...prev,
          [doctorId]: {
            doctorId,
            doctorName: data.doctorName || 'Doctor',
            specialty: data.specialty || '',
            avgWaitMin: data.avgWaitMin || 15,
            avgConsultationMin: data.avgConsultationMin || 12,
            currentToken: data.currentToken || {
              token: '---',
              patientName: 'N/A',
              status: 'Idle',
            },
            waitingList: data.waitingList || [],
            waiting: data.waiting ?? data.waitingList?.length ?? 0,
            servedToday: data.servedToday || 0,
            noShowToday: data.noShowToday || 0,
            isHeld: Boolean(data.isHeld),
            isEnded: Boolean(data.isEnded),
            history: [],
          },
        }))
      } catch (error) {
        console.error(`Failed to fetch queue for doctor ${doctorId}:`, error)
        // Fallback to local structure if endpoint is not populated yet
        const currentDoc = doctors.find((d) => (d._id || d.id) === doctorId)
        setQueueStates((prev) => ({
          ...prev,
          [doctorId]: prev[doctorId] || buildInitialQueueState(currentDoc),
        }))
      } finally {
        setLoadingQueue(false)
      }
    }

    loadQueueData(selectedDoctorId)
  }, [selectedDoctorId, doctors])

  const selectedDoctor = useMemo(
    () => doctors.find((d) => (d._id || d.id) === selectedDoctorId),
    [doctors, selectedDoctorId]
  )

  const queue =
    queueStates[selectedDoctorId] || buildInitialQueueState(selectedDoctor)

  const updateQueue = (updater) => {
    setQueueStates((prev) => ({
      ...prev,
      [selectedDoctorId]: updater(
        prev[selectedDoctorId] || buildInitialQueueState(selectedDoctor)
      ),
    }))
  }

  const handleSelectDoctor = (id) => {
    setSelectedDoctorId(id)
    setSearchQuery('')
  }

  // --- Queue Actions with API Integration ---

  const handleNext = async () => {
    if (queue.isEnded) return
    if (queue.isHeld) {
      toast.error('Queue is on hold. Resume to continue.')
      return
    }
    if (queue.waitingList.length === 0) {
      toast.error('No patients waiting.')
      return
    }

    // Optimistic local UI update
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
        servedToday: q.servedToday + 1,
      }
    })

    try {
      await api.post(`/clinic/doctors/${selectedDoctorId}/queue/next`)
    } catch (error) {
      console.error('Failed to update queue next on server:', error)
      toast.error('Server sync failed. Restoring queue...')
      handleUndo()
    }
  }

  const handleSkip = async () => {
    if (queue.isEnded) return
    if (queue.isHeld) {
      toast.error('Queue is on hold. Resume to continue.')
      return
    }
    if (queue.waitingList.length === 0) {
      toast.error('No patients waiting.')
      return
    }

    // Optimistic local UI update
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
        noShowToday: q.noShowToday + 1,
      }
    })
    toast.success('Patient skipped')

    try {
      await api.post(`/clinic/doctors/${selectedDoctorId}/queue/skip`)
    } catch (error) {
      console.error('Failed to update queue skip on server:', error)
      toast.error('Server sync failed. Restoring queue...')
      handleUndo()
    }
  }

  const handleUndo = async () => {
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

    try {
      await api.post(`/clinic/doctors/${selectedDoctorId}/queue/undo`)
    } catch (error) {
      console.error('Failed to trigger undo on server:', error)
    }
  }

  const handleToggleHold = async () => {
    const nextHoldState = !queue.isHeld
    updateQueue((q) => ({ ...q, isHeld: nextHoldState }))

    try {
      await api.post(`/clinic/doctors/${selectedDoctorId}/queue/hold`, {
        isHeld: nextHoldState,
      })
    } catch (error) {
      console.error('Failed to update hold state on server:', error)
      updateQueue((q) => ({ ...q, isHeld: !nextHoldState }))
      toast.error('Failed to toggle queue hold state')
    }
  }

  const handleEndQueue = async () => {
    if (queue.isEnded) return
    const confirmed = window.confirm(
      `End today's queue for ${queue.doctorName}? This cannot be undone.`
    )
    if (!confirmed) return

    updateQueue((q) => ({ ...q, isEnded: true, isHeld: false }))
    toast.success('Queue ended for today')

    try {
      await api.post(`/clinic/doctors/${selectedDoctorId}/queue/end`)
    } catch (error) {
      console.error('Failed to end queue on server:', error)
      toast.error('Failed to end queue on server')
    }
  }

  // Calculation helpers
  const formatConsultationTime = (minutesFromNow) => {
    const estimated = new Date(
      currentTime.getTime() + minutesFromNow * 60 * 1000
    )
    return estimated.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const waitingPatients = useMemo(() => {
    const consultationTime = queue.avgConsultationMin || 12

    return queue.waitingList.map((patient, index) => {
      const position = index + 1
      const estimatedWait = position * consultationTime

      return {
        ...patient,
        position,
        estimatedWait,
        estimatedConsultationTime: formatConsultationTime(estimatedWait),
      }
    })
  }, [queue.waitingList, queue.avgConsultationMin, currentTime])

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return waitingPatients

    const term = searchQuery.toLowerCase().trim()
    return waitingPatients.filter(
      (p) =>
        p.patientName.toLowerCase().includes(term) ||
        p.token.toLowerCase().includes(term)
    )
  }, [waitingPatients, searchQuery])

  const stats = [
    { key: 'waiting', label: 'Waiting', value: queue.waiting, color: 'text-gray-800 dark:text-gray-100' },
    { key: 'avgWait', label: 'Avg. Wait Time', value: `${queue.avgWaitMin} min`, color: 'text-gray-800 dark:text-gray-100' },
    { key: 'served', label: 'Served Today', value: queue.servedToday, color: 'text-green-600 dark:text-green-400' },
    { key: 'noShow', label: 'No Show Today', value: queue.noShowToday, color: 'text-red-500 dark:text-red-400' },
  ]

  if (loadingDoctors) {
    return (
      <ClinicDashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-medium">Loading doctors...</span>
          </div>
        </div>
      </ClinicDashboardLayout>
    )
  }

  if (doctors.length === 0 || !selectedDoctor) {
    return (
      <ClinicDashboardLayout>
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6">
          <p className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
            No Doctors Found
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Please register or assign doctors to manage clinic queues.
          </p>
        </div>
      </ClinicDashboardLayout>
    )
  }

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
                doctors={availableDoctors}
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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Queue Management
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Manage your clinic queue in real-time
        </p>
        {showSelector && (
          <DoctorSelector
            doctors={availableDoctors}
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
            ? 'This queue has ended for today.'
            : 'Queue is on hold — patients are not being called.'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Current Token */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 relative">
          {loadingQueue && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
              <Loader2 className="animate-spin text-brand-600" size={20} />
            </div>
          )}
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
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 relative">
          {loadingQueue && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
              <Loader2 className="animate-spin text-brand-600" size={20} />
            </div>
          )}
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
        {/* Waiting List Section */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft p-5 relative">
          {loadingQueue && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
              <Loader2 className="animate-spin text-brand-600" size={20} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Waiting List
            </p>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token or name..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {queue.waitingList.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No patients waiting.
            </p>
          ) : filteredPatients.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No matching patients found.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    <th className="font-medium py-2 px-1 w-8">#</th>
                    <th className="font-medium py-2 px-1">Token</th>
                    <th className="font-medium py-2 px-1">Patient Name</th>
                    <th className="font-medium py-2 px-1 text-right">Waiting Time</th>
                    <th className="font-medium py-2 px-1 text-right">Est. Consultation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((row) => (
                    <tr
                      key={row.token}
                      className="border-t border-gray-50 dark:border-gray-800"
                    >
                      <td className="py-2.5 px-1 text-gray-400">{row.position}</td>
                      <td className="py-2.5 px-1">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {row.token}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {row.patientName}
                      </td>
                      <td className="py-2.5 px-1 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <Clock3 size={13} />
                          ~{row.estimatedWait} min
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-right whitespace-nowrap">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          ~{row.estimatedConsultationTime}
                        </span>
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
              disabled={queue.isEnded || queue.isHeld || loadingQueue}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white transition-colors"
            >
              Next Token
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleUndo}
              disabled={queue.history.length === 0 || loadingQueue}
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

            <ActionButton
              icon={SkipForward}
              label="Skip Token"
              tone="blue"
              onClick={handleSkip}
              disabled={queue.isEnded || queue.isHeld || loadingQueue}
            />
            <ActionButton
              icon={queue.isHeld ? PlayCircle : PauseCircle}
              label={queue.isHeld ? 'Resume Queue' : 'Hold Queue'}
              tone="orange"
              onClick={handleToggleHold}
              disabled={queue.isEnded || loadingQueue}
            />
            <ActionButton
              icon={Square}
              label="End Queue"
              tone="red"
              onClick={handleEndQueue}
              disabled={queue.isEnded || loadingQueue}
            />
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

function DoctorSelector({ doctors, selectedDoctorId, onSelect, open, setOpen, fullWidth }) {
  const selected = doctors.find((d) => (d._id || d.id) === selectedDoctorId) || {}

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 ${
          fullWidth ? 'w-full justify-between' : ''
        }`}
      >
        <span className="truncate">
          {selected.name || selected.doctorName || 'Select Doctor'} — {selected.specialty || ''}
        </span>
        <ChevronDown size={15} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft z-20 overflow-hidden">
            {doctors.map((doc) => {
              const id = doc._id || doc.id
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
                  <span className="truncate">{doc.name || doc.doctorName}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {doc.specialty}
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