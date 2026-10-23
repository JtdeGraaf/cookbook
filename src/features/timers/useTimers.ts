import { useEffect, useState, useSyncExternalStore } from 'react'
import type { KitchenTimer } from '@/lib/timers'
import { timerStore } from './timer-store'

export function useTimers(): KitchenTimer[] {
  return useSyncExternalStore(timerStore.subscribe, timerStore.getTimers)
}

export function useTimer(id: string): KitchenTimer | null {
  return useTimers().find((timer) => timer.id === id) ?? null
}

/** The current time, refreshed a few times a second while `active`, for countdown displays. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(interval)
  }, [active])
  return now
}
