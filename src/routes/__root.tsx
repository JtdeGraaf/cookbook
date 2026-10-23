import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { NotFound } from '@/components/NotFound'
import { ChapterTabs } from '@/features/book/ChapterTabs'
import { TimerTray } from '@/features/timers/TimerTray'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="book">
      <Header />
      <ChapterTabs />
      <main className="page">
        <Outlet />
      </main>
      <TimerTray />
    </div>
  )
}
