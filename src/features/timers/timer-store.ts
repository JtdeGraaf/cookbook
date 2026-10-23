import { readSaved, save } from '@/lib/storage'
import {
  finishDueTimers,
  parseSavedTimers,
  pauseTimer,
  removeTimer,
  resumeTimer,
  startTimer,
  type KitchenTimer,
  type NewTimer,
} from '@/lib/timers'
import { startAlarm, stopAlarm, unlockSound } from './alarm'

const TIMERS_KEY = 'timers'
const TICK_MS = 250

type Listener = () => void

let timers: KitchenTimer[] = readSaved(TIMERS_KEY, parseSavedTimers) ?? []
const listeners = new Set<Listener>()
let tick: ReturnType<typeof setInterval> | null = null

function update(next: KitchenTimer[]): void {
  timers = next
  save(TIMERS_KEY, timers)
  listeners.forEach((listener) => listener())
  keepTickingWhileRunning()
  if (!timers.some((timer) => timer.state.kind === 'finished')) stopAlarm()
}

/** One shared clock for all timers; it only runs while a timer is counting down. */
function keepTickingWhileRunning(): void {
  const anyRunning = timers.some((timer) => timer.state.kind === 'running')
  if (anyRunning && tick === null) tick = setInterval(checkForFinishedTimers, TICK_MS)
  if (!anyRunning && tick !== null) {
    clearInterval(tick)
    tick = null
  }
}

function checkForFinishedTimers(): void {
  const result = finishDueTimers(timers, Date.now())
  if (result.justFinished.length === 0) return
  update(result.timers)
  startAlarm()
}

export const timerStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getTimers(): KitchenTimer[] {
    return timers
  },
  start(timer: NewTimer): void {
    // Starting is a click, which is when browsers allow sound to be switched on.
    unlockSound()
    update(startTimer(timers, timer, Date.now()))
  },
  pause(id: string): void {
    update(pauseTimer(timers, id, Date.now()))
  },
  resume(id: string): void {
    update(resumeTimer(timers, id, Date.now()))
  },
  remove(id: string): void {
    update(removeTimer(timers, id))
  },
  /** Picks up timers that finished while the page was closed. */
  resumeAfterLoad(): void {
    checkForFinishedTimers()
    keepTickingWhileRunning()
  },
}
