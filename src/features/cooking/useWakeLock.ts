import { useEffect } from 'react'

/**
 * Keeps the screen from dimming while `active`, where the browser supports it. The browser drops the lock when the
 * tab is hidden, so it is asked for again when the cook comes back.
 */
export function useWakeLock(active: boolean): boolean {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator

  useEffect(() => {
    if (!active || !supported) return
    let lock: WakeLockSentinel | null = null
    let stopped = false

    function requestLock() {
      navigator.wakeLock
        .request('screen')
        .then((granted) => {
          if (stopped) return void granted.release()
          lock = granted
        })
        // Refused, for example on low battery: the screen just dims as usual.
        .catch(() => {})
    }
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') requestLock()
    }

    requestLock()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void lock?.release()
    }
  }, [active, supported])

  return supported
}
