import { z } from 'zod/mini'
import type { LocalizedText } from './recipe-rules'

/** A kitchen timer started from a recipe step. Times are epoch milliseconds, so a timer survives a page reload. */
export type KitchenTimer = {
  /** One timer per step: `<chapter>/<recipe>/<phase>/<step number>`. */
  id: string
  label: LocalizedText
  recipeTitle: LocalizedText
  /** Where to go back to from the timer tray. */
  path: string
  durationMs: number
  state: TimerState
}

export type TimerState =
  | { kind: 'running'; endsAt: number }
  | { kind: 'paused'; remainingMs: number }
  | { kind: 'finished'; finishedAt: number }

export type NewTimer = Omit<KitchenTimer, 'state'>

export function timerId(chapterSlug: string, recipeSlug: string, phase: 'prep' | 'cook', stepNumber: number): string {
  return `${chapterSlug}/${recipeSlug}/${phase}/${stepNumber}`
}

/** Starts a timer, or restarts it from the top if this step's timer already exists. */
export function startTimer(timers: KitchenTimer[], timer: NewTimer, now: number): KitchenTimer[] {
  const started: KitchenTimer = { ...timer, state: { kind: 'running', endsAt: now + timer.durationMs } }
  const others = timers.filter((existing) => existing.id !== timer.id)
  return [...others, started]
}

export function pauseTimer(timers: KitchenTimer[], id: string, now: number): KitchenTimer[] {
  return timers.map((timer) => {
    if (timer.id !== id || timer.state.kind !== 'running') return timer
    return { ...timer, state: { kind: 'paused', remainingMs: Math.max(0, timer.state.endsAt - now) } }
  })
}

export function resumeTimer(timers: KitchenTimer[], id: string, now: number): KitchenTimer[] {
  return timers.map((timer) => {
    if (timer.id !== id || timer.state.kind !== 'paused') return timer
    return { ...timer, state: { kind: 'running', endsAt: now + timer.state.remainingMs } }
  })
}

export function removeTimer(timers: KitchenTimer[], id: string): KitchenTimer[] {
  return timers.filter((timer) => timer.id !== id)
}

export function remainingMs(timer: KitchenTimer, now: number): number {
  switch (timer.state.kind) {
    case 'running':
      return Math.max(0, timer.state.endsAt - now)
    case 'paused':
      return timer.state.remainingMs
    case 'finished':
      return 0
  }
}

/** Marks running timers whose time is up as finished, and says which ones just rang. */
export function finishDueTimers(timers: KitchenTimer[], now: number): { timers: KitchenTimer[]; justFinished: KitchenTimer[] } {
  const justFinished: KitchenTimer[] = []
  const updated = timers.map((timer): KitchenTimer => {
    if (timer.state.kind !== 'running' || timer.state.endsAt > now) return timer
    const finished: KitchenTimer = { ...timer, state: { kind: 'finished', finishedAt: timer.state.endsAt } }
    justFinished.push(finished)
    return finished
  })
  return { timers: justFinished.length > 0 ? updated : timers, justFinished }
}

/** "4:05" under an hour, "1:02:05" from an hour. Rounds up, so a timer shows 0:00 only when it is done. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const twoDigits = (value: number) => String(value).padStart(2, '0')
  if (hours > 0) return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}`
  return `${minutes}:${twoDigits(seconds)}`
}

const savedTextSchema = z.strictObject({ en: z.string(), nl: z.string() })

const savedTimerSchema = z.strictObject({
  id: z.string(),
  label: savedTextSchema,
  recipeTitle: savedTextSchema,
  path: z.string().check(z.startsWith('/')),
  durationMs: z.number().check(z.positive()),
  state: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('running'), endsAt: z.number() }),
    z.strictObject({ kind: z.literal('paused'), remainingMs: z.number().check(z.minimum(0)) }),
    z.strictObject({ kind: z.literal('finished'), finishedAt: z.number() }),
  ]),
})

/** Saved timers from an older version or a hand-edited storage are dropped rather than half-loaded. */
export function parseSavedTimers(value: unknown): KitchenTimer[] | null {
  const result = z.array(savedTimerSchema).safeParse(value)
  return result.success ? result.data : null
}
