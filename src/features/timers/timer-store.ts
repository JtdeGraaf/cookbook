import { createSavedStore } from '@/lib/saved-store'
import {
  finishDueTimers,
  finishedTimerIds,
  keepGoingTimersAfterFinish,
  parseSavedTimers,
  pauseTimer,
  removeTimer,
  resumeTimer,
  startTimer,
  timersNoLongerRinging,
  timersToNotify,
  type KitchenTimer,
  type NewTimer,
} from '@/lib/timers'
import { startAlarm, stopAlarm, unlockSound } from './alarm'
import { askToNotifyOnce, closeNotifications, notifyFinished } from './notifications'

const TICK_MS = 250

/** Shared with the book open in other tabs, so a timer started or stopped in one shows in all of them. */
const savedTimers = createSavedStore<KitchenTimer[]>('timers', parseSavedTimers, [])
let tick: ReturnType<typeof setInterval> | null = null
// The timers as this tab last saw them; only timers that finished since then ring and notify.
let lastSeenTimers = savedTimers.get()

// Runs after every change, also one made in another tab: that tab may have finished a timer or stopped the alarm.
savedTimers.subscribe(() => {
  const timers = savedTimers.get()
  const justFinished = timersToNotify(lastSeenTimers, timers)
  closeNotifications(timersNoLongerRinging(lastSeenTimers, timers))
  lastSeenTimers = timers
  keepTickingWhileRunning(timers)
  if (finishedTimerIds(timers).length === 0) stopAlarm()
  if (justFinished.length === 0) return
  startAlarm()
  notifyFinished(justFinished)
})

/** One shared clock for all timers; it only runs while a timer is counting down. */
function keepTickingWhileRunning(timers: KitchenTimer[]): void {
  const anyRunning = timers.some((timer) => timer.state.kind === 'running')
  if (anyRunning && tick === null) tick = setInterval(checkForFinishedTimers, TICK_MS)
  if (!anyRunning && tick !== null) {
    clearInterval(tick)
    tick = null
  }
}

function checkForFinishedTimers(): void {
  const now = Date.now()
  // Looks at the copy in memory first, so storage is only touched when a timer is actually due.
  if (finishDueTimers(savedTimers.get(), now).justFinished.length === 0) return
  savedTimers.set((timers) => finishDueTimers(timers, now).timers)
}

export const timerStore = {
  subscribe: savedTimers.subscribe,
  getTimers: savedTimers.get,
  start(timer: NewTimer): void {
    // Starting is a click, which is when browsers allow switching sound on and asking to show notifications.
    unlockSound()
    askToNotifyOnce()
    savedTimers.set((timers) => startTimer(timers, timer, Date.now()))
  },
  pause(id: string): void {
    savedTimers.set((timers) => pauseTimer(timers, id, Date.now()))
  },
  resume(id: string): void {
    savedTimers.set((timers) => resumeTimer(timers, id, Date.now()))
  },
  remove(id: string): void {
    savedTimers.set((timers) => removeTimer(timers, id))
  },
  finishRecipe(recipePath: string, donePagePath: string): void {
    savedTimers.set((timers) => keepGoingTimersAfterFinish(timers, recipePath, donePagePath))
  },
  /** Picks up timers that finished while the page was closed, and from then on each time the page comes back into sight. */
  resumeAfterLoad(): void {
    checkForFinishedTimers()
    keepTickingWhileRunning(savedTimers.get())
    // A hidden page's clock is slowed down or frozen, so the banner should not wait for its next tick.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForFinishedTimers()
    })
  },
}
