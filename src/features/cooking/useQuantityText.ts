import { useTranslation } from 'react-i18next'
import type { Ingredient, Quantity } from '@/lib/book'
import { formatAmount, pluralCount, scaleQuantity } from '@/lib/quantity'
import { useLanguage } from '@/features/settings/useLanguage'

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
  return (ingredient, factor) => quantityLabel(ingredient.quantity ? scaleQuantity(ingredient.quantity, factor) : null)
}
