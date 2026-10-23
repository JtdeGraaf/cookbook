import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { parseServingsParam } from '@/lib/links'
import { pageOrNotFound } from '@/features/book/find-in-book'
import { FolderPage } from '@/features/browse/FolderPage'
import { RecipePage } from '@/features/cooking/RecipePage'

/** Every folder and recipe page: the address is the path of folders under `recipes/`. */
export const Route = createFileRoute('/$')({
  validateSearch: (search: Record<string, unknown>): { servings?: number } => {
    const servings = parseServingsParam(search.servings)
    return servings === null ? {} : { servings }
  },
  loader: ({ params }) => pageOrNotFound(params._splat ?? ''),
  component: BookPage,
})

function BookPage() {
  const page = Route.useLoaderData()
  const { servings } = Route.useSearch()
  const navigate = useNavigate({ from: '/$' })
  if (page.kind === 'folder') return <FolderPage folder={page.folder} />
  return (
    <RecipePage
      recipe={page.recipe}
      view={page.view}
      linkedServings={servings ?? null}
      onLinkedServingsUsed={() => void navigate({ to: '.', search: {}, replace: true })}
    />
  )
}
