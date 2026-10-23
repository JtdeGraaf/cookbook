import { createFileRoute } from '@tanstack/react-router'
import { recipeOrNotFound } from '@/features/book/find-in-book'
import { Finished } from '@/features/cooking/Finished'
import { useRecipeProgress } from '@/features/cooking/useRecipeProgress'
import '@/features/cooking/cooking.css'

export const Route = createFileRoute('/$chapter/$recipe/done')({
  loader: ({ params }) => recipeOrNotFound(params.chapter, params.recipe),
  component: DonePage,
})

function DonePage() {
  const { chapter, recipe } = Route.useLoaderData()
  const controls = useRecipeProgress(recipe)
  return (
    <div data-color={chapter.color}>
      <Finished recipe={recipe} controls={controls} />
    </div>
  )
}
