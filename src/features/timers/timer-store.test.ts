// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
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

type Shown = { title: string; options: NotificationOptions & { vibrate?: number[] }; closed: boolean }

/** A browser that allows notifications, with a service worker that keeps what it shows. */
function phoneBrowser(permission: NotificationPermission) {
  const shown: Shown[] = []
  const registration = {
    showNotification: async (title: string, options: Shown['options']) => {
      shown.push({ title, options, closed: false })
    },
    getNotifications: async ({ tag }: { tag: string }) =>
      shown.filter((notification) => notification.options.tag === tag && !notification.closed).map((notification) => ({
        close: () => {
          notification.closed = true
        },
      })),
  }
  const requestPermission = vi.fn(async () => permission)
  vi.stubGlobal('Notification', { permission, requestPermission })
  Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration: async () => registration }, configurable: true })
  return { shown, requestPermission }
}

function pageIs(visibility: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { value: visibility, configurable: true })
}

function finishInOtherTab(id: string): void {
  saveInOtherTab('timers', [timerFromOtherTab(id, { kind: 'finished', finishedAt: Date.now() })])
}

describe('timerStore notifications', () => {
  beforeEach(async () => {
    await setUpTranslations('en')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'serviceWorker')
    Reflect.deleteProperty(document, 'visibilityState')
  })

  it('shows a vibrating notification that stays when a timer finishes while the page is hidden', async () => {
    const { shown } = phoneBrowser('granted')
    pageIs('hidden')

    finishInOtherTab('mains/pasta/carbonara/cook/2')

    await vi.waitFor(() => expect(shown).toHaveLength(1))
    expect(shown[0].title).toBe('Time’s up: mains/pasta/carbonara/cook/2')
    expect(shown[0].options).toMatchObject({
      body: 'Carbonara · tap to go back',
      tag: 'mains/pasta/carbonara/cook/2',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      data: { path: '/mains/pasta/carbonara/cook/2' },
    })
  })

  it('shows nothing while the page is on screen, since the banner already says it', async () => {
    const { shown } = phoneBrowser('granted')
    pageIs('visible')

    finishInOtherTab('mains/pasta/carbonara/cook/2')
    await Promise.resolve()

    expect(isAlarmRinging()).toBe(true)
    expect(shown).toEqual([])
  })

  it('shows nothing when notifications were refused', async () => {
    const { shown } = phoneBrowser('denied')
    pageIs('hidden')

    finishInOtherTab('mains/pasta/carbonara/cook/2')
    await Promise.resolve()

    expect(shown).toEqual([])
  })

  it('closes the notification when the timer is stopped', async () => {
    const { shown } = phoneBrowser('granted')
    pageIs('hidden')
    finishInOtherTab('mains/pasta/carbonara/cook/2')
    await vi.waitFor(() => expect(shown).toHaveLength(1))

    timerStore.remove('mains/pasta/carbonara/cook/2')

    await vi.waitFor(() => expect(shown[0].closed).toBe(true))
  })

  it('asks for notifications at the first timer started, and never again', () => {
    const { requestPermission } = phoneBrowser('default')

    timerStore.start(newTimer('mains/pasta/carbonara/cook/2', 5))
    timerStore.start(newTimer('mains/pasta/carbonara/cook/3', 5))

    expect(requestPermission).toHaveBeenCalledTimes(1)
  })

  it('starts timers as before where the browser has no notifications', () => {
    timerStore.start(newTimer('mains/pasta/carbonara/cook/2', 5))

    expect(timerStore.getTimers().map((timer) => timer.state.kind)).toEqual(['running'])
  })

  it('rings straight away when the page comes back into sight after its timer was up', () => {
    vi.useFakeTimers()
    timerStore.resumeAfterLoad()
    timerStore.start(newTimer('mains/pasta/carbonara/cook/2', 1))

    // A hidden page's clock may not have ticked at all.
    vi.setSystemTime(Date.now() + 2 * MINUTE)
    pageIs('visible')
    document.dispatchEvent(new Event('visibilitychange'))

    expect(timerStore.getTimers().map((timer) => timer.state.kind)).toEqual(['finished'])
    expect(isAlarmRinging()).toBe(true)
  })
})
