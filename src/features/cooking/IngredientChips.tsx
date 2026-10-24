import { Trans, useTranslation } from 'react-i18next'
import { ingredientsForStep, type Ingredient, type Recipe, type Step } from '@/lib/book'
import { servingsFactor } from '@/lib/quantity'
import { useIngredientName, useQuantityText } from './useQuantityText'

type IngredientChipsProps = { recipe: Recipe; step: Step; servings: number }

/** The ingredients one step uses, with amounts for the chosen servings. */
export function IngredientChips({ recipe, step, servings }: IngredientChipsProps) {
  const { t } = useTranslation()
  const ingredients = ingredientsForStep(recipe, step)
  if (ingredients.length === 0) return null
  const factor = servingsFactor(recipe.servings, servings)
  return (
    <div className="chips">
      <span className="visually-hidden">{t('recipe.ingredientsUsed')}</span>
      <ul className="chips__list">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="chip">
            <ChipText ingredient={ingredient} factor={factor} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "150 g spaghetti", or "salt, to taste" with the name first when there is no amount. */
function ChipText({ ingredient, factor }: { ingredient: Ingredient; factor: number }) {
  const quantityText = useQuantityText()
  const ingredientName = useIngredientName()
  const name = ingredientName(ingredient, factor)
  if (!ingredient.quantity) {
    return (
      <Trans
        i18nKey="recipe.chipToTaste"
        values={{ name }}
        components={{ amount: <span className="chip__amount numbers" /> }}
      />
    )
  }
  return (
    <>
      <span className="chip__amount numbers">{quantityText(ingredient, factor)}</span> {name}
    </>
  )
}
