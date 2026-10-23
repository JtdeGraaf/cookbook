import { createFileRoute } from '@tanstack/react-router'
import { recipeOrNotFound, stepNumberOrNotFound } from '@/features/book/find-in-book'
import { CookStep } from '@/features/cooking/CookStep'
import { PrepNotDone } from '@/features/cooking/PrepNotDone'
import { RecipeWorkspace } from '@/features/cooking/RecipeWorkspace'
import { useRecipeProgress } from '@/features/cooking/useRecipeProgress'

export const Route = createFileRoute('/$chapter/$recipe/cook/$step')({
  loader: ({ params }) => {
    const found = recipeOrNotFound(params.chapter, params.recipe)
    return { ...found, stepNumber: stepNumberOrNotFound(found.recipe, params.step) }
  },
  component: CookPage,
})

function CookPage() {
  const { chapter, recipe, stepNumber } = Route.useLoaderData()
  const controls = useRecipeProgress(recipe)
  return (
    <div data-color={chapter.color}>
      <RecipeWorkspace recipe={recipe} controls={controls}>
        {controls.prepDone ? (
          <CookStep recipe={recipe} controls={controls} stepNumber={stepNumber} />
        ) : (
          <PrepNotDone recipe={recipe} />
        )}
      </RecipeWorkspace>
    </div>
  )
}
