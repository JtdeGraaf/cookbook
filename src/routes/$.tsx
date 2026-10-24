import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { filtersFromSearch, parseFilterSearch, searchFromFilters, type FilterSearch } from '@/lib/filters'
import { parseServingsParam } from '@/lib/links'
import { pageOrNotFound } from '@/features/book/find-in-book'
import { FolderPage } from '@/features/browse/FolderPage'
import { RecipePage } from '@/features/cooking/RecipePage'

/** Every folder and recipe page: the address is the path of folders under `recipes/`. */
export const Route = createFileRoute('/$')({
  validateSearch: (search: Record<string, unknown>): FilterSearch & { servings?: number } => {
    const servings = parseServingsParam(search.servings)
    return { ...parseFilterSearch(search), ...(servings === null ? {} : { servings }) }
  },
  loader: ({ params }) => pageOrNotFound(params._splat ?? ''),
  component: BookPage,
})

function BookPage() {
  const page = Route.useLoaderData()
  const { servings, ...filterSearch } = Route.useSearch()
  const navigate = useNavigate({ from: '/$' })
  if (page.kind === 'folder') {
    return (
      <FolderPage
        folder={page.folder}
        filters={filtersFromSearch(filterSearch)}
        onFiltersChange={(filters) => void navigate({ to: '.', search: searchFromFilters(filters), replace: true })}
      />
    )
  }
  return (
    <RecipePage
      key={page.recipe.path}
      recipe={page.recipe}
      view={page.view}
      linkedServings={servings ?? null}
      onLinkedServingsUsed={() => void navigate({ to: '.', search: {}, replace: true })}
    />
  )
}
