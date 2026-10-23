import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { NotFound } from '@/components/NotFound'
import { ChapterTabs } from '@/features/book/ChapterTabs'
import { usePageKind } from '@/features/book/usePageKind'
import { TimerTray } from '@/features/timers/TimerTray'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const pageKind = usePageKind()
  return (
    <div className="book" data-page={pageKind}>
      <Header pageKind={pageKind} />
      <ChapterTabs />
      <main className="page">
        <Outlet />
      </main>
      <TimerTray />
    </div>
  )
}
