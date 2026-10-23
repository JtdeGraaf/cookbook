import { createFileRoute } from '@tanstack/react-router'
import { SearchResults } from '@/features/search/SearchResults'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  return <SearchResults query={q} />
}
