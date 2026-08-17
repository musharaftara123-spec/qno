// frontend/src/utils/sound.js
// Web Audio API based notification sounds — no mp3/wav assets required.
// Playback is gated behind a real user gesture (click/touch/keydown) so
// browsers don't block it as autoplay, and the AudioContext is created
// lazily, once, on first use.

let audioCtx = null
let userHasInteracted = false
let lastPlayKey = null
let lastPlayTime = 0

// Ignores a repeat call for the same milestone fired within this window.
// This is a safety net on top of the caller's own "shown milestones" set —
// it protects against things like React StrictMode's double effect-invoke
// or fast back-to-back re-renders triggering the same sound twice.
const MIN_REPEAT_GAP_MS = 300

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  // Browsers create the context 'suspended' until a user gesture unlocks it.
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Call once a real user gesture has happened, to satisfy the browser's
// autoplay policy (audio can't start "cold" with no prior interaction).
function unlockAudio() {
  if (userHasInteracted) return
  userHasInteracted = true
  getAudioContext()
}

if (typeof window !== 'undefined') {
  const events = ['click', 'touchstart', 'keydown']
  const handleFirstInteraction = () => {
    unlockAudio()
    events.forEach((evt) => window.removeEventListener(evt, handleFirstInteraction))
  }
  events.forEach((evt) =>
    window.addEventListener(evt, handleFirstInteraction, { once: true, passive: true })
  )
}

/**
 * Plays a single tone with a punchy attack and short decay (energetic,
 * not soft) — fast ramp up, controlled ramp down instead of a long fade.
 * @param {number} frequency - Hz
 * @param {number} duration - seconds
 * @param {'sine'|'square'|'triangle'|'sawtooth'} type
 * @param {number} startTime - offset in seconds from "now"
 * @param {number} volume - 0..1
 */
function playTone({ frequency, duration = 0.14, type = 'square', startTime = 0, volume = 0.5 }) {
  if (!userHasInteracted) return // silently no-op before any user interaction

  const ctx = getAudioContext()
  const now = ctx.currentTime + startTime

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)

  // Fast attack (snappy, not soft) then a controlled decay so it still
  // feels punchy rather than a slow fade-out.
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.008)
  gainNode.gain.setValueAtTime(volume, now + duration * 0.55)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

/** Plays several tones back-to-back (used for multi-tone chimes). Tight
 * gaps between notes keep the sequence feeling energetic instead of slow. */
function playToneSequence(tones, gap = 0.02) {
  let cursor = 0
  tones.forEach((tone) => {
    playTone({ ...tone, startTime: cursor })
    cursor += tone.duration + gap
  })
}

function shouldSkipDuplicate(key) {
  const now = Date.now()
  if (key === lastPlayKey && now - lastPlayTime < MIN_REPEAT_GAP_MS) {
    return true
  }
  lastPlayKey = key
  lastPlayTime = now
  return false
}

/** 10 people remaining — still the "calmest" alert, but a crisp, audible beep
 * rather than a slow fade. */
export function playTenRemaining() {
  if (shouldSkipDuplicate('ten')) return
  playTone({ frequency: 440, duration: 0.16, type: 'triangle', volume: 0.45 })
}

/** 5 people remaining — brighter, punchier double-beep. */
export function playFiveRemaining() {
  if (shouldSkipDuplicate('five')) return
  playToneSequence([
    { frequency: 660, duration: 0.12, type: 'square', volume: 0.55 },
    { frequency: 660, duration: 0.12, type: 'square', volume: 0.55 },
  ])
}

/** 2 people remaining — fast, urgent triple-blip, high pitch. */
export function playTwoRemaining() {
  if (shouldSkipDuplicate('two')) return
  playToneSequence(
    [
      { frequency: 880, duration: 0.1, type: 'square', volume: 0.6 },
      { frequency: 880, duration: 0.1, type: 'square', volume: 0.6 },
      { frequency: 880, duration: 0.1, type: 'square', volume: 0.6 },
    ],
    0.03
  )
}

/** Your turn — loud, energetic success fanfare (fast ascending run + big
 * final hit) so it's unmistakable. */
export function playYourTurn() {
  if (shouldSkipDuplicate('turn')) return
  playToneSequence(
    [
      { frequency: 523.25, duration: 0.11, type: 'square', volume: 0.55 }, // C5
      { frequency: 659.25, duration: 0.11, type: 'square', volume: 0.6 },  // E5
      { frequency: 783.99, duration: 0.11, type: 'square', volume: 0.65 }, // G5
      { frequency: 1046.5, duration: 0.32, type: 'sawtooth', volume: 0.7 }, // C6 - big finish
    ],
    0.015
  )
}

// Central map — makes it trivial to add future milestones in one place
// (e.g. playMilestoneSound('checkedIn')) without touching call sites.
const MILESTONE_SOUND_MAP = {
  10: playTenRemaining,
  5: playFiveRemaining,
  2: playTwoRemaining,
  turn: playYourTurn,
}

/** Plays the sound mapped to a milestone key (10 | 5 | 2 | 'turn'). */
export function playMilestoneSound(milestoneKey) {
  const fn = MILESTONE_SOUND_MAP[milestoneKey]
  if (fn) fn()
}

export default {
  playTenRemaining,
  playFiveRemaining,
  playTwoRemaining,
  playYourTurn,
  playMilestoneSound,
}