import { recipeViewPath, type Recipe, type StepTimer } from '@/lib/book'
import { remainingMs, timerId, type TimerState } from '@/lib/timers'
import { timerStore } from './timer-store'
import { useNow, useTimer } from './useTimers'

/** A step's timer is idle until it is started. */
export type StepTimerState = TimerState['kind'] | 'idle'

type StepTimerOptions = { recipe: Recipe; phase: 'prep' | 'cook'; stepNumber: number; timer: StepTimer }

/** The timer that belongs to one step, and what you can do with it. */
export function useStepTimer({ recipe, phase, stepNumber, timer }: StepTimerOptions) {
  const id = timerId(recipe.path, phase, stepNumber)
  const kitchenTimer = useTimer(id)
  const now = useNow(kitchenTimer?.state.kind === 'running')
  const durationMs = timer.minutes * 60_000
  const state: StepTimerState = kitchenTimer?.state.kind ?? 'idle'
  const path = '/' + recipeViewPath(recipe, phase === 'cook' ? { name: 'cook', stepNumber } : { name: 'prep' })

  return {
    state,
    remaining: kitchenTimer ? remainingMs(kitchenTimer, now) : durationMs,
    start: () => timerStore.start({ id, label: timer.label, recipeTitle: recipe.title, path, durationMs }),
    pause: () => timerStore.pause(id),
    resume: () => timerStore.resume(id),
    remove: () => timerStore.remove(id),
  }
}
