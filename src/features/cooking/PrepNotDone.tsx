import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/lib/book'

/** Shown instead of a cooking step while the prep list still has open tasks. */
export function PrepNotDone({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  return (
    <section className="gate">
      <h1 className="gate__title">{t('cook.prepNotDone')}</h1>
      <p className="gate__text">{t('cook.prepNotDoneExplain')}</p>
      <Link to="/$chapter/$recipe/prep" params={{ chapter: recipe.chapterSlug, recipe: recipe.slug }} className="button">
        {t('cook.goToPrep')}
      </Link>
    </section>
  )
}
