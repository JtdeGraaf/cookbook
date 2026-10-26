import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header'
import { NotFound } from '@/components/NotFound'
import { useFocusOnNavigate } from '@/components/useFocusOnNavigate'
import { hasSeveralChapters } from '@/lib/book'
import { ChapterTabs } from '@/features/book/ChapterTabs'
import { book } from '@/features/book/book-data'
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
  const showChapterTabs = hasSeveralChapters(book)
  useKeepScreenOn(pageKind)
  useFocusOnNavigate(page)
  return (
    <div className="book" data-page={pageKind} data-chapter-tabs={showChapterTabs}>
      <a href="#page" className="skip-link">
        {t('header.skipToPage')}
      </a>
      <Header />
      {showChapterTabs && <ChapterTabs />}
      <main ref={page} id="page" tabIndex={-1} className="page">
        <Outlet />
      </main>
      <TimerTray />
    </div>
  )
}
