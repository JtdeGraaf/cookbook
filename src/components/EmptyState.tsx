import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  hint: string
  /** The way on from here, so an empty page is never a dead end. */
  action: ReactNode
}

/** One look for every "nothing here" page: what is empty, why, and where to go next. */
export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h1 className="empty-state__title">{title}</h1>
      <p className="empty-state__hint">{hint}</p>
      <div className="empty-state__action">{action}</div>
    </section>
  )
}
