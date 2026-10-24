import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { CoverImage } from '@/components/CoverImage'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { timersOfRecipe } from '@/lib/timers'
import { useLocalized } from '@/features/settings/useLanguage'
import { useShoppingList } from '@/features/shopping/useShoppingList'
import { useTimers } from '@/features/timers/useTimers'
import { PhaseHead } from './PhaseHead'
import { RecipeNotes } from './RecipeNotes'

/**
 * The last page after Finish. The cooking session is closed by then (ticks, rung timers and shopping-list entry
 * cleared), though a timer still going, like a mousse setting, keeps going and leads here. This is the place to jot
 * a note for next time, or put the recipe back on the list to cook it again soon.
 */
export function Finished({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const shopping = useShoppingList()
  const timersLeft = timersOfRecipe(useTimers(), recipe.path).length
  const title = localized(recipe.title)
  return (
    <section className="finished">
      <CoverImage
        recipe={recipe}
        sizes="(min-width: 760px) 420px, 100vw"
        className="finished__photo"
        showCredit={false}
        eager
      />
      <div className="finished__words">
        <PhaseHead recipe={recipe} title={t('done.title')}>
          <p className="finished__text">{timersLeft > 0 ? t('done.bodyTimersLeft', { title, count: timersLeft }) : t('done.body', { title })}</p>
        </PhaseHead>
        <div className="finished__actions">
          <BookLink path={recipe.path} className="button">
            {t('done.again')}
          </BookLink>
          {!shopping.isOnList(recipe) && (
            <button type="button" className="button button--quiet" onClick={() => shopping.add(recipe)}>
              <Icon name="basket" size={20} />
              {t('done.backOnList')}
            </button>
          )}
        </div>
        <RecipeNotes recipe={recipe} />
      </div>
    </section>
  )
}
