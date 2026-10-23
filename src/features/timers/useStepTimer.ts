import { recipeViewPath, type Recipe, type StepTimer } from '@/lib/book'
import { remainingMs, timerId } from '@/lib/timers'
import { timerStore } from './timer-store'
import { useNow, useTimer } from './useTimers'

type StepTimerOptions = { recipe: Recipe; phase: 'prep' | 'cook'; stepNumber: number; timer: StepTimer }

/** The timer that belongs to one step, and what you can do with it. */
export function useStepTimer({ recipe, phase, stepNumber, timer }: StepTimerOptions) {
  const id = timerId(recipe.path, phase, stepNumber)
  const kitchenTimer = useTimer(id)
  const now = useNow(kitchenTimer?.state.kind === 'running')
  const durationMs = timer.minutes * 60_000
  const path = '/' + recipeViewPath(recipe, phase === 'cook' ? { name: 'cook', stepNumber } : { name: 'prep' })

  return {
    state: kitchenTimer?.state.kind ?? 'idle',
    remaining: kitchenTimer ? remainingMs(kitchenTimer, now) : durationMs,
    start: () => timerStore.start({ id, label: timer.label, recipeTitle: recipe.title, path, durationMs }),
    pause: () => timerStore.pause(id),
    resume: () => timerStore.resume(id),
    remove: () => timerStore.remove(id),
  }
}
