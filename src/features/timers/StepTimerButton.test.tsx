// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'
import { timerStore } from './timer-store'
import { both, makeRecipe } from '@/test/fixtures'
import { StepTimerButton } from './StepTimerButton'

const carbonara = makeRecipe({ slug: 'carbonara' })
const coolOff = { minutes: 1, label: both('Cool off the heat') }

function renderTimer(phase: 'prep' | 'cook' = 'cook') {
  render(<StepTimerButton recipe={carbonara} phase={phase} stepNumber={4} timer={coolOff} />)
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

beforeAll(async () => {
  await setUpTranslations('en')
})

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
})

afterEach(() => {
  cleanup()
  act(() => timerStore.getTimers().forEach((timer) => timerStore.remove(timer.id)))
  vi.useRealTimers()
})

describe('StepTimerButton', () => {
  it.each(['cook', 'prep'] as const)('keeps keyboard focus on the %s timer through start, pause and resume', async (phase) => {
    const user = renderTimer(phase)

    await user.tab()
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Pause Cool off the heat' }))

    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Resume Cool off the heat' }))

    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Pause Cool off the heat' }))
  })

  it('puts focus back on Start after the alarm is stopped', async () => {
    const user = renderTimer()
    await user.click(screen.getByRole('button', { name: /Start timer/ }))
    act(() => vi.advanceTimersByTime(61_000))

    await user.click(screen.getByRole('button', { name: 'Stop alarm' }))

    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Start timer · 1:00/ }))
  })

  it('moves focus from Pause to Stop alarm when the time is up', async () => {
    const user = renderTimer()
    await user.tab()
    await user.keyboard('{Enter}')

    act(() => vi.advanceTimersByTime(61_000))

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Stop alarm' }))
  })

  it('leaves focus alone when a timer finishes while the reader is elsewhere', async () => {
    const user = renderTimer()
    await user.click(screen.getByRole('button', { name: /Start timer/ }))
    const elsewhere = document.body.appendChild(document.createElement('button'))
    elsewhere.focus()

    act(() => vi.advanceTimersByTime(61_000))

    expect(document.activeElement).toBe(elsewhere)
    elsewhere.remove()
  })

  it('names the timer on the restart button', async () => {
    const user = renderTimer()

    await user.click(screen.getByRole('button', { name: /Start timer/ }))

    expect(screen.getByRole('button', { name: 'Restart Cool off the heat' })).toBeInTheDocument()
  })
})
