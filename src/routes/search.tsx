import { createFileRoute } from '@tanstack/react-router'
import { BookShell } from '@/features/browse/BookShell'
import { SearchResults } from '@/features/search/SearchResults'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  return (
    <BookShell currentPath="">
      <SearchResults query={q} />
    </BookShell>
  )
}
