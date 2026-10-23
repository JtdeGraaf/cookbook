import { createFileRoute } from '@tanstack/react-router'
import { recipeOrNotFound } from '@/features/book/find-in-book'
import { RecipeSpread } from '@/features/cooking/RecipeSpread'
import { useRecipeProgress } from '@/features/cooking/useRecipeProgress'

export const Route = createFileRoute('/$chapter/$recipe/')({
  loader: ({ params }) => recipeOrNotFound(params.chapter, params.recipe),
  component: RecipePage,
})

function RecipePage() {
  const { chapter, recipe } = Route.useLoaderData()
  const controls = useRecipeProgress(recipe)
  return (
    <div data-color={chapter.color}>
      <RecipeSpread recipe={recipe} chapter={chapter} controls={controls} />
    </div>
  )
}
