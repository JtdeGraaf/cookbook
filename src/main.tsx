import '@fontsource/zen-maru-gothic/latin-700.css'
import '@fontsource/zen-maru-gothic/latin-900.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-700.css'
import './index.css'
import './components/layout.css'
import './print.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setUpTranslations, startingLanguage } from './i18n/i18n'
import { applyTheme } from './features/settings/useTheme'
import { unlockSoundOnFirstTap } from './features/timers/alarm'
import { timerStore } from './features/timers/timer-store'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree, scrollRestoration: true, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

applyTheme()
timerStore.resumeAfterLoad()
unlockSoundOnFirstTap()

// Saves the book for offline use. Only in the built site; in development it would serve stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'))
}

void setUpTranslations(startingLanguage()).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
