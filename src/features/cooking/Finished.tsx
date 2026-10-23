import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { CoverImage } from '@/components/CoverImage'
import type { Recipe } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { ClearTicksButton } from './ClearTicksButton'
import type { RecipeProgressControls } from './useRecipeProgress'
import { useRecordCookedToday } from './useRecipeJournal'

/** The last page after the final step. Reaching it writes today into the recipe's journal. */
export function Finished({ recipe, controls }: { recipe: Recipe; controls: RecipeProgressControls }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  useRecordCookedToday(recipe)

  return (
    <section className="finished">
      <CoverImage recipe={recipe} sizes="(min-width: 760px) 420px, 100vw" className="finished__photo" showCredit={false} />
      <div className="finished__words">
        <h1 className="finished__title">{t('done.title')}</h1>
        <p className="finished__text">{t('done.body', { title: localized(recipe.title) })}</p>
        <div className="finished__actions">
          <BookLink path={recipe.path} className="button">
            {t('done.again')}
          </BookLink>
          <ClearTicksButton controls={controls} />
        </div>
      </div>
    </section>
  )
}
