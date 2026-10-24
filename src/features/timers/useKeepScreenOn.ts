import type { PageKind } from '@/features/book/usePageKind'
import { useWakeLock } from '@/features/cooking/useWakeLock'
import { useTimers } from './useTimers'

/** The screen stays on while prepping or cooking, and on any page while a timer runs, so a timer never stalls. */
export function useKeepScreenOn(pageKind: PageKind) {
  const timerRunning = useTimers().some((timer) => timer.state.kind === 'running')
  useWakeLock(pageKind === 'cooking' || timerRunning)
}
