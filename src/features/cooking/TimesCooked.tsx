import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/lib/book'
import { formatCookedDate } from '@/lib/journal'
import { useLanguage } from '@/features/settings/useLanguage'
import { useRecipeJournal } from './useRecipeJournal'

/** "Cooked 3 times, last on 23 October 2026" ("Made" for a drink), or that it hasn't been made yet. */
export function TimesCooked({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { journal } = useRecipeJournal(recipe)
  const lastCooked = journal.cookedOn[0]
  const isDrink = recipe.kind === 'drink'
  if (!lastCooked) return <p className="spread__cooked">{isDrink ? t('recipe.neverMade') : t('recipe.neverCooked')}</p>
  const counted = { count: journal.cookedOn.length, date: formatCookedDate(lastCooked, language) }
  return (
    <p className="spread__cooked">{isDrink ? t('recipe.madeCount', counted) : t('recipe.cookedCount', counted)}</p>
  )
}
