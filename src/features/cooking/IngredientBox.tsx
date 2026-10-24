import { useTranslation } from 'react-i18next'
import { Tick } from '@/components/Tick'
import type { Recipe } from '@/lib/book'
import { servingsFactor } from '@/lib/quantity'
import { useLocalized } from '@/features/settings/useLanguage'
import { ServingsStepper } from './ServingsStepper'
import type { RecipeProgressControls } from './useRecipeProgress'
import { useIngredientName, useQuantityText } from './useQuantityText'

type IngredientBoxProps = { recipe: Recipe; controls: RecipeProgressControls }

/** The boxed ingredient list with a servings counter in its header, each line tickable. */
export function IngredientBox({ recipe, controls }: IngredientBoxProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const quantityText = useQuantityText()
  const ingredientName = useIngredientName()
  const factor = servingsFactor(recipe.servings, controls.servings)
  const have = controls.progress.haveIngredientIds
  return (
    <section className="ingredient-box" aria-labelledby={`ingredients-${recipe.slug}`}>
      <header className="ingredient-box__head">
        <h2 id={`ingredients-${recipe.slug}`} className="ingredient-box__title">
          {t('recipe.ingredients')}
        </h2>
        <ServingsStepper servings={controls.servings} onChange={controls.setServings} />
      </header>
      <ul className="ingredient-box__list">
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <label className="ingredient-line">
              <Tick checked={have.includes(ingredient.id)} onChange={() => controls.toggleIngredient(ingredient.id)} />
              <span className="ingredient-line__name">
                {ingredientName(ingredient, factor)}
                {ingredient.note && <span className="ingredient-line__note">{localized(ingredient.note)}</span>}
              </span>
              <span className="ingredient-line__leader" aria-hidden="true" />
              <span className="ingredient-line__amount numbers">{quantityText(ingredient, factor)}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="ingredient-box__count numbers">
        {t('recipe.checkedCount', { checked: have.length, total: recipe.ingredients.length })}
      </p>
    </section>
  )
}
