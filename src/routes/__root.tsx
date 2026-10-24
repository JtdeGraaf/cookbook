import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header'
import { NotFound } from '@/components/NotFound'
import { useFocusOnNavigate } from '@/components/useFocusOnNavigate'
import { ChapterTabs } from '@/features/book/ChapterTabs'
import { usePageKind } from '@/features/book/usePageKind'
import { TimerTray } from '@/features/timers/TimerTray'
import { useKeepScreenOn } from '@/features/timers/useKeepScreenOn'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const { t } = useTranslation()
  const pageKind = usePageKind()
  const page = useRef<HTMLElement>(null)
  useKeepScreenOn(pageKind)
  useFocusOnNavigate(page)
  return (
    <div className="book" data-page={pageKind}>
      <a href="#page" className="skip-link">
        {t('header.skipToPage')}
      </a>
      <Header />
      <ChapterTabs />
      <main ref={page} id="page" tabIndex={-1} className="page">
        <Outlet />
      </main>
      <TimerTray />
    </div>
  )
}
