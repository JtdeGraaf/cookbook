import { describe, expect, it } from 'vitest'
import { both } from '@/test/fixtures'
import {
  finishDueTimers,
  formatClock,
  parseSavedTimers,
  pauseTimer,
  remainingMs,
  removeTimer,
  resumeTimer,
  startTimer,
  type NewTimer,
} from './timers'

const MINUTE = 60_000

function newTimer(id: string, minutes: number): NewTimer {
  return { id, label: both(id), recipeTitle: both('Recipe'), path: '/mains/recipe/cook/1', durationMs: minutes * MINUTE }
}

describe('kitchen timers', () => {
  it('counts down from the moment it starts', () => {
    const [timer] = startTimer([], newTimer('sauce', 10), 1_000)

    expect(remainingMs(timer, 1_000 + 4 * MINUTE)).toBe(6 * MINUTE)
  })

  it('runs several timers at once', () => {
    let timers = startTimer([], newTimer('potatoes', 20), 0)
    timers = startTimer(timers, newTimer('sausage', 15), MINUTE)

    expect(timers.map((timer) => remainingMs(timer, 5 * MINUTE))).toEqual([15 * MINUTE, 11 * MINUTE])
  })

  it('restarts a step timer instead of adding a second one', () => {
    let timers = startTimer([], newTimer('sauce', 10), 0)
    timers = startTimer(timers, newTimer('sauce', 10), 3 * MINUTE)

    expect(timers).toHaveLength(1)
    expect(remainingMs(timers[0], 3 * MINUTE)).toBe(10 * MINUTE)
  })

  it('holds its time while paused and carries on after resuming', () => {
    let timers = startTimer([], newTimer('sauce', 10), 0)
    timers = pauseTimer(timers, 'sauce', 4 * MINUTE)

    expect(remainingMs(timers[0], 30 * MINUTE)).toBe(6 * MINUTE)

    timers = resumeTimer(timers, 'sauce', 30 * MINUTE)

    expect(remainingMs(timers[0], 32 * MINUTE)).toBe(4 * MINUTE)
  })

  it('finishes timers whose time is up and reports only those', () => {
    let timers = startTimer([], newTimer('short', 1), 0)
    timers = startTimer(timers, newTimer('long', 10), 0)

    const result = finishDueTimers(timers, 2 * MINUTE)

    expect(result.justFinished.map((timer) => timer.id)).toEqual(['short'])
    expect(result.timers.map((timer) => timer.state.kind)).toEqual(['finished', 'running'])
  })

  it('does not report a finished timer twice', () => {
    const first = finishDueTimers(startTimer([], newTimer('short', 1), 0), 2 * MINUTE)

    const second = finishDueTimers(first.timers, 3 * MINUTE)

    expect(second.justFinished).toEqual([])
  })

  it('removes a timer', () => {
    const timers = startTimer([], newTimer('sauce', 10), 0)

    expect(removeTimer(timers, 'sauce')).toEqual([])
  })
})

describe('formatClock', () => {
  it('shows minutes and seconds, rounded up', () => {
    expect(formatClock(4 * MINUTE + 4_200)).toBe('4:05')
    expect(formatClock(0)).toBe('0:00')
  })

  it('adds hours from one hour', () => {
    expect(formatClock(62 * MINUTE + 5_000)).toBe('1:02:05')
  })
})

describe('parseSavedTimers', () => {
  it('reads back timers it saved', () => {
    const timers = startTimer([], newTimer('sauce', 10), 0)

    expect(parseSavedTimers(JSON.parse(JSON.stringify(timers)))).toEqual(timers)
  })

  it('drops saved data that does not look like timers', () => {
    expect(parseSavedTimers([{ id: 'sauce' }])).toBeNull()
    expect(parseSavedTimers('nonsense')).toBeNull()
  })
})
