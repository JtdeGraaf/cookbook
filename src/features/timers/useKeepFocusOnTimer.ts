import { useEffect, useRef, type FocusEvent } from 'react'
import type { StepTimerState } from './useStepTimer'

/**
 * Starting, pausing, finishing and stopping a timer swap its buttons for different ones. When that drops keyboard
 * focus, this puts it on the main control of the new state (Start, Pause, Resume or Stop alarm), so nobody has to
 * tab in from the top of the page again mid-cooking.
 */
export function useKeepFocusOnTimer(state: StepTimerState) {
  const mainControl = useRef<HTMLButtonElement>(null)
  const focusIsHere = useRef(false)

  useEffect(() => {
    if (!focusIsHere.current || !focusWasLost()) return
    mainControl.current?.focus({ preventScroll: true })
  }, [state])

  const focusEvents = {
    onFocus: () => {
      focusIsHere.current = true
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      // A button that is swapped out blurs with nowhere to go; only moving to another element counts as leaving.
      const movedTo = event.relatedTarget
      if (movedTo && !event.currentTarget.contains(movedTo)) focusIsHere.current = false
    },
  }

  return { mainControl, focusEvents }
}

function focusWasLost(): boolean {
  return document.activeElement === null || document.activeElement === document.body
}
