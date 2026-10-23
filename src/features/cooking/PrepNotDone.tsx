import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { recipeViewPath, type Recipe } from '@/lib/book'

/** Shown instead of a cooking step while the prep list still has open tasks. */
export function PrepNotDone({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  return (
    <section className="gate">
      <h1 className="gate__title">{t('cook.prepNotDone')}</h1>
      <p className="gate__text">{t('cook.prepNotDoneExplain')}</p>
      <BookLink path={recipeViewPath(recipe, { name: 'prep' })} className="button">
        {t('cook.goToPrep')}
      </BookLink>
    </section>
  )
}
