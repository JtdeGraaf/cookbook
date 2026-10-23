import type { Recipe, RecipeView } from '@/lib/book'
import { CookStep } from './CookStep'
import { Finished } from './Finished'
import { PrepChecklist } from './PrepChecklist'
import { PrepNotDone } from './PrepNotDone'
import { RecipeSpread } from './RecipeSpread'
import { RecipeWorkspace } from './RecipeWorkspace'
import { useLinkedServings } from './useLinkedServings'
import { useRecipeProgress, type RecipeProgressControls } from './useRecipeProgress'

type RecipePageProps = {
  recipe: Recipe
  view: RecipeView
  /** Servings from a shared link (`?servings=6`), or null. */
  linkedServings: number | null
  onLinkedServingsUsed: () => void
}

/** Every page of one recipe. Ticks and servings are shared, so they carry over from prep to cooking. */
export function RecipePage({ recipe, view, linkedServings, onLinkedServingsUsed }: RecipePageProps) {
  const controls = useRecipeProgress(recipe)
  useLinkedServings(controls, linkedServings, onLinkedServingsUsed)
  return (
    <div data-color={recipe.color}>
      <RecipeViewContent recipe={recipe} view={view} controls={controls} />
    </div>
  )
}

type RecipeViewContentProps = { recipe: Recipe; view: RecipeView; controls: RecipeProgressControls }

function RecipeViewContent({ recipe, view, controls }: RecipeViewContentProps) {
  switch (view.name) {
    case 'overview':
      return <RecipeSpread recipe={recipe} controls={controls} />
    case 'prep':
      return (
        <RecipeWorkspace recipe={recipe} controls={controls}>
          <PrepChecklist recipe={recipe} controls={controls} />
        </RecipeWorkspace>
      )
    case 'cook':
      return (
        <RecipeWorkspace recipe={recipe} controls={controls}>
          {controls.prepDone ? (
            <CookStep recipe={recipe} controls={controls} stepNumber={view.stepNumber} />
          ) : (
            <PrepNotDone recipe={recipe} />
          )}
        </RecipeWorkspace>
      )
    case 'done':
      return <Finished recipe={recipe} controls={controls} />
  }
}
