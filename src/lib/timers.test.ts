import { describe, expect, it } from 'vitest'
import { both } from '@/test/fixtures'
import {
  finishDueTimers,
  formatClock,
  isShownOnItsStep,
  keepGoingTimersAfterFinish,
  parseSavedTimers,
  pauseTimer,
  remainingMs,
  removeTimer,
  resumeTimer,
  sortForShelf,
  startTimer,
  timersOfRecipe,
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

describe('keepGoingTimersAfterFinish', () => {
  const DONE_PAGE = '/desserts/chocolate-mousse/done'

  function mousseTimer(stepNumber: number, minutes: number): NewTimer {
    return { ...newTimer(`desserts/chocolate-mousse/cook/${stepNumber}`, minutes), path: `/desserts/chocolate-mousse/cook/${stepNumber}` }
  }

  it('keeps a running timer going and points it at the done page', () => {
    const timers = startTimer([], mousseTimer(5, 120), 0)

    const [kept] = keepGoingTimersAfterFinish(timers, 'desserts/chocolate-mousse', DONE_PAGE)

    expect(kept.id).toBe('desserts/chocolate-mousse/cook/5')
    expect(kept.path).toBe(DONE_PAGE)
    expect(kept.state).toEqual({ kind: 'running', endsAt: 120 * MINUTE })
  })

  it('keeps a paused timer paused', () => {
    let timers = startTimer([], mousseTimer(5, 120), 0)
    timers = pauseTimer(timers, 'desserts/chocolate-mousse/cook/5', 30 * MINUTE)

    const [kept] = keepGoingTimersAfterFinish(timers, 'desserts/chocolate-mousse', DONE_PAGE)

    expect(kept.state).toEqual({ kind: 'paused', remainingMs: 90 * MINUTE })
  })

  it('puts away the timers of the recipe that already rang', () => {
    let timers = startTimer([], mousseTimer(2, 1), -2 * MINUTE)
    timers = finishDueTimers(timers, 0).timers
    timers = startTimer(timers, mousseTimer(5, 120), 0)

    const kept = keepGoingTimersAfterFinish(timers, 'desserts/chocolate-mousse', DONE_PAGE)

    expect(kept.map((timer) => timer.id)).toEqual(['desserts/chocolate-mousse/cook/5'])
  })

  it('leaves the timers of other recipes alone, even a ringing one', () => {
    let timers = startTimer([], newTimer('mains/pasta/carbonara/cook/1', 1), -2 * MINUTE)
    timers = finishDueTimers(timers, 0).timers
    timers = startTimer(timers, newTimer('mains/pasta/carbonara-light/cook/1', 5), 0)

    expect(keepGoingTimersAfterFinish(timers, 'mains/pasta/carbonara-light', DONE_PAGE)[0]).toEqual(timers[0])
  })
})

describe('timersOfRecipe', () => {
  it('finds the timers of one recipe and not those of a recipe whose name starts the same', () => {
    let timers = startTimer([], newTimer('mains/pasta/carbonara/cook/1', 9), 0)
    timers = startTimer(timers, newTimer('mains/pasta/carbonara/prep/1', 10), 0)
    timers = startTimer(timers, newTimer('mains/pasta/carbonara-light/cook/1', 5), 0)

    expect(timersOfRecipe(timers, 'mains/pasta/carbonara').map((timer) => timer.id)).toEqual([
      'mains/pasta/carbonara/cook/1',
      'mains/pasta/carbonara/prep/1',
    ])
  })
})

describe('isShownOnItsStep', () => {
  const [cookTimer] = startTimer([], { ...newTimer('mains/soup/cook/2', 5), path: '/mains/soup/cook/2' }, 0)

  it('is true on the cooking step the timer belongs to', () => {
    expect(isShownOnItsStep(cookTimer, '/mains/soup/cook/2')).toBe(true)
  })

  it('is false on another page', () => {
    expect(isShownOnItsStep(cookTimer, '/mains/soup/cook/3')).toBe(false)
  })

  it('is false for a prep timer on the prep page', () => {
    const [prepTimer] = startTimer([], { ...newTimer('mains/soup/prep/1', 5), path: '/mains/soup/prep' }, 0)

    expect(isShownOnItsStep(prepTimer, '/mains/soup/prep')).toBe(false)
  })

  it('is false for a timer kept after Finish, on the done page', () => {
    const [kept] = keepGoingTimersAfterFinish([cookTimer], 'mains/soup', '/mains/soup/done')

    expect(isShownOnItsStep(kept, '/mains/soup/done')).toBe(false)
  })
})

describe('sortForShelf', () => {
  it('puts ringing timers first, then the one that rings soonest, paused ones last', () => {
    let timers = startTimer([], newTimer('long', 20), 0)
    timers = startTimer(timers, newTimer('paused', 1), 0)
    timers = pauseTimer(timers, 'paused', 0)
    timers = startTimer(timers, newTimer('short', 5), 0)
    timers = startTimer(timers, newTimer('rang', 1), -2 * MINUTE)
    timers = finishDueTimers(timers, 0).timers

    expect(sortForShelf(timers, 0).map((timer) => timer.id)).toEqual(['rang', 'short', 'long', 'paused'])
  })
})
