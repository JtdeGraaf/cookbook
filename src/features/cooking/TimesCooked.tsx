import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/lib/book'
import { formatCookedDate } from '@/lib/journal'
import { useLanguage } from '@/features/settings/useLanguage'
import { useRecipeJournal } from './useRecipeJournal'

/** "Cooked 3 times, last on 23 October 2026", or that it hasn't been made yet. */
export function TimesCooked({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { journal } = useRecipeJournal(recipe)
  const lastCooked = journal.cookedOn[0]
  return (
    <p className="spread__cooked">
      {lastCooked
        ? t('recipe.cookedCount', { count: journal.cookedOn.length, date: formatCookedDate(lastCooked, language) })
        : t('recipe.neverCooked')}
    </p>
  )
}
