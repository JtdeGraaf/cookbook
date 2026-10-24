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
import { useRecipeJournal } from './useRecipeJournal'

/**
 * The last page after Finish. The cooking session is closed by then (ticks, rung timers and shopping-list entry
 * cleared), though a timer still going, like a mousse setting, keeps going and leads here. From here the cook can
 * read the recipe again, or put it (back) on the list to cook it again soon. The journal says whether Finish took it
 * off the list, so a reload of this page still tells it right.
 */
export function Finished({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const shopping = useShoppingList()
  const { journal } = useRecipeJournal(recipe)
  const timersLeft = timersOfRecipe(useTimers(), recipe.path).length
  const title = localized(recipe.title)
  const offList = journal.takenOffShoppingList === true
  const body =
    timersLeft > 0
      ? t(offList ? 'done.bodyOffListTimersLeft' : 'done.bodyTimersLeft', { title, count: timersLeft })
      : t(offList ? 'done.bodyOffList' : 'done.body', { title })
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
          <p className="finished__text">{body}</p>
        </PhaseHead>
        <div className="finished__actions">
          <BookLink path={recipe.path} className="button">
            {t('done.again')}
          </BookLink>
          {!shopping.isOnList(recipe) && (
            <button type="button" className="button button--quiet" onClick={() => shopping.add(recipe)}>
              <Icon name="basket" size={20} />
              {offList ? t('done.backOnList') : t('done.addToList')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
