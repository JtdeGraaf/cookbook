import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Photo } from '@/components/Photo'
import type { Recipe } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { ClearTicksButton } from './ClearTicksButton'
import type { RecipeProgressControls } from './useRecipeProgress'

/** The last page after the final step. */
export function Finished({ recipe, controls }: { recipe: Recipe; controls: RecipeProgressControls }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <section className="finished">
      <Photo picture={recipe.cover} sizes="(min-width: 760px) 420px, 100vw" className="finished__photo" showCredit={false} />
      <div className="finished__words">
        <h1 className="finished__title">{t('done.title')}</h1>
        <p className="finished__text">{t('done.body', { title: localized(recipe.title) })}</p>
        <div className="finished__actions">
          <Link to="/$chapter/$recipe" params={{ chapter: recipe.chapterSlug, recipe: recipe.slug }} className="button">
            {t('done.again')}
          </Link>
          <ClearTicksButton controls={controls} />
        </div>
      </div>
    </section>
  )
}
