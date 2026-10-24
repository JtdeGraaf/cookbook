import { useTranslation } from 'react-i18next'
import type { Ingredient, Quantity } from '@/lib/book'
import { nameForAmount, type IngredientNames } from '@/lib/ingredient-name'
import { formatAmount, pluralCount, scaleIngredient } from '@/lib/quantity'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'

/** "1½ tbsp", "3 cloves", or "to taste" for no amount. */
export function useQuantityLabel(): (quantity: Quantity | null) => string {
  const { t } = useTranslation()
  const { language } = useLanguage()
  return (quantity) => {
    if (!quantity) return t('recipe.toTaste')
    const unit = t(`units.${quantity.unit}`, { count: pluralCount(quantity) })
    return [formatAmount(quantity, language), unit].filter(Boolean).join(' ')
  }
}

/** The amount of an ingredient for the chosen servings. */
export function useQuantityText(): (ingredient: Ingredient, factor: number) => string {
  const quantityLabel = useQuantityLabel()
  return (ingredient, factor) => quantityLabel(scaleIngredient(ingredient, factor))
}

/** "egg" or "eggs", whichever fits the amount, in the reader's language. */
export function useNameForAmount(): (names: IngredientNames, quantity: Quantity | null) => string {
  const localized = useLocalized()
  return (names, quantity) => localized(nameForAmount(names, quantity))
}

/** The name of an ingredient for the chosen servings: "1 egg", "3 eggs". */
export function useIngredientName(): (ingredient: Ingredient, factor: number) => string {
  const nameFor = useNameForAmount()
  return (ingredient, factor) => nameFor(ingredient, scaleIngredient(ingredient, factor))
}
