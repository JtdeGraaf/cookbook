import { useSyncExternalStore } from 'react'
import { readSaved, save } from '@/lib/storage'
import { oppositeTheme, parseTheme, pickTheme, type Theme } from '@/lib/theme'

const THEME_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const listeners = new Set<() => void>()

function currentTheme(): Theme {
  return pickTheme(readSaved(THEME_KEY, parseTheme), window.matchMedia(DARK_QUERY).matches)
}

/** Sets `data-theme` on <html>; index.html does the same before first paint to avoid a flash. */
export function applyTheme(): void {
  document.documentElement.dataset.theme = currentTheme()
}

function subscribe(listener: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  const onSystemChange = () => {
    applyTheme()
    listener()
  }
  listeners.add(listener)
  media.addEventListener('change', onSystemChange)
  return () => {
    listeners.delete(listener)
    media.removeEventListener('change', onSystemChange)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme)

  function toggleTheme() {
    save(THEME_KEY, oppositeTheme(theme))
    applyTheme()
    listeners.forEach((listener) => listener())
  }

  return { theme, toggleTheme }
}
