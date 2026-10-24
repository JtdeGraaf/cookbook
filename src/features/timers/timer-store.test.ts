// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { both } from '@/test/fixtures'
import { saveInOtherTab, saveInOtherTabQuietly } from '@/test/other-tab'
import type { KitchenTimer, NewTimer } from '@/lib/timers'
import { isAlarmRinging } from './alarm'
import { timerStore } from './timer-store'

const MINUTE = 60_000

function newTimer(id: string, minutes: number): NewTimer {
  return { id, label: both(id), recipeTitle: both('Carbonara'), path: `/${id}`, durationMs: minutes * MINUTE }
}

function timerFromOtherTab(id: string, state: KitchenTimer['state']): KitchenTimer {
  return { ...newTimer(id, 10), state }
}

afterEach(() => {
  timerStore.getTimers().forEach((timer) => timerStore.remove(timer.id))
  window.localStorage.clear()
  vi.useRealTimers()
})

describe('timerStore with the book open in two tabs', () => {
  it('shows a timer started in the other tab', () => {
    saveInOtherTab('timers', [timerFromOtherTab('mains/pasta/carbonara/cook/2', { kind: 'running', endsAt: Date.now() + MINUTE })])

    expect(timerStore.getTimers().map((timer) => timer.id)).toEqual(['mains/pasta/carbonara/cook/2'])
  })

  it('keeps the other tab’s timer when this tab starts one before hearing about it', () => {
    saveInOtherTabQuietly('timers', [timerFromOtherTab('mains/pasta/carbonara/cook/2', { kind: 'running', endsAt: Date.now() + MINUTE })])

    timerStore.start(newTimer('mains/pasta/aglio-e-olio/cook/1', 5))

    expect(timerStore.getTimers().map((timer) => timer.id)).toEqual([
      'mains/pasta/carbonara/cook/2',
      'mains/pasta/aglio-e-olio/cook/1',
    ])
  })

  it('rings when the other tab finishes a timer and goes quiet when the other tab stops it', () => {
    vi.useFakeTimers()
    timerStore.start(newTimer('mains/pasta/carbonara/cook/2', 1))
    const [started] = timerStore.getTimers()

    saveInOtherTab('timers', [{ ...started, state: { kind: 'finished', finishedAt: Date.now() } }])

    expect(isAlarmRinging()).toBe(true)

    saveInOtherTab('timers', [])

    expect(isAlarmRinging()).toBe(false)
  })

  it('rings once its own clock finds a timer is up', () => {
    vi.useFakeTimers()
    timerStore.start(newTimer('mains/pasta/carbonara/cook/2', 1))

    vi.advanceTimersByTime(MINUTE + 500)

    expect(timerStore.getTimers().map((timer) => timer.state.kind)).toEqual(['finished'])
    expect(isAlarmRinging()).toBe(true)
  })
})
