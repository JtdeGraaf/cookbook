import { useTranslation } from 'react-i18next'
import type { Ingredient } from '@/lib/book'
import { formatAmount, pluralCount, scaleQuantity } from '@/lib/quantity'
import { useLanguage } from '@/features/settings/useLanguage'

/** "1½ tbsp", "3 cloves", "to taste": the amount of an ingredient for the chosen servings. */
export function useQuantityText(): (ingredient: Ingredient, factor: number) => string {
  const { t } = useTranslation()
  const { language } = useLanguage()
  return (ingredient, factor) => {
    if (!ingredient.quantity) return t('recipe.toTaste')
    const scaled = scaleQuantity(ingredient.quantity, factor)
    const unit = t(`units.${scaled.unit}`, { count: pluralCount(scaled) })
    return [formatAmount(scaled, language), unit].filter(Boolean).join(' ')
  }
}
