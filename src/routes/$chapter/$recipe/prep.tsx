import { createFileRoute } from '@tanstack/react-router'
import { recipeOrNotFound } from '@/features/book/find-in-book'
import { PrepChecklist } from '@/features/cooking/PrepChecklist'
import { RecipeWorkspace } from '@/features/cooking/RecipeWorkspace'
import { useRecipeProgress } from '@/features/cooking/useRecipeProgress'

export const Route = createFileRoute('/$chapter/$recipe/prep')({
  loader: ({ params }) => recipeOrNotFound(params.chapter, params.recipe),
  component: PrepPage,
})

function PrepPage() {
  const { chapter, recipe } = Route.useLoaderData()
  const controls = useRecipeProgress(recipe)
  return (
    <div data-color={chapter.color}>
      <RecipeWorkspace recipe={recipe} controls={controls}>
        <PrepChecklist recipe={recipe} controls={controls} />
      </RecipeWorkspace>
    </div>
  )
}
