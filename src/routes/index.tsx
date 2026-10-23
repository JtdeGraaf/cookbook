import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { filtersFromSearch, parseFilterSearch, searchFromFilters, type FilterSearch } from '@/lib/filters'
import { Contents } from '@/features/book/Contents'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): FilterSearch => parseFilterSearch(search),
  component: ContentsPage,
})

function ContentsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  return (
    <Contents
      filters={filtersFromSearch(search)}
      onFiltersChange={(filters) => void navigate({ search: searchFromFilters(filters), replace: true })}
    />
  )
}
