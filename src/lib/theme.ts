export type Theme = 'light' | 'dark'

export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null
}

/** A saved choice wins; without one the book follows the system setting. */
export function pickTheme(saved: Theme | null, systemPrefersDark: boolean): Theme {
  if (saved) return saved
  return systemPrefersDark ? 'dark' : 'light'
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}
