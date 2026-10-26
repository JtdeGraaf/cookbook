import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { EmptyPlate } from '@/components/EmptyPlate'
import { Icon } from '@/components/Icon'
import { folderTrail, type Recipe } from '@/lib/book'
import type { LocalizedText } from '@/lib/recipe-rules'
import { useFavourites } from '@/features/favourites/useFavourites'
import { useLocalized } from '@/features/settings/useLanguage'
import { useShoppingList } from '@/features/shopping/useShoppingList'
import { book, pageOf } from './book-data'
import './book.css'

type RecipeRowProps = {
  recipe: Recipe
  /** Shown under the title in search results: which ingredients matched. */
  matchedIngredients?: LocalizedText[]
  /** Folder pages add a line of the summary under the title. */
  showSummary?: boolean
  /** Search results say which folders the recipe is in. */
  showFolder?: boolean
  /** Rows near the top load their photo straight away instead of waiting to be scrolled to. */
  eager?: boolean
}

/**
 * One line of the contents, the same everywhere: thumbnail, title with a heart or basket when it is a favourite or
 * on the shopping list, time, dotted leader, page number.
 */
export function RecipeRow({
  recipe,
  matchedIngredients = [],
  showSummary = false,
  showFolder = false,
  eager = false,
}: RecipeRowProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { isFavourite } = useFavourites()
  const shopping = useShoppingList()
  const page = pageOf(recipe.path)
  const folders = showFolder ? folderTrail(book, recipe.folderPath).map((folder) => localized(folder.title)) : []
  return (
    <li className="recipe-row" data-color={recipe.color}>
      <BookLink path={recipe.path} className="recipe-row__link">
        {recipe.cover ? (
          <img
            className="recipe-row__thumb"
            src={recipe.cover.file.src}
            srcSet={recipe.cover.file.srcset}
            sizes="96px"
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <span className="recipe-row__thumb recipe-row__thumb--empty">
            <EmptyPlate title={localized(recipe.title)} />
          </span>
        )}
        <span className="recipe-row__text">
          <span className="recipe-row__title">
            {localized(recipe.title)}
            {isFavourite(recipe.path) && (
              <span className="recipe-row__mark recipe-row__mark--favourite" title={t('recipe.favourite')}>
                <Icon name="heartFilled" size={14} />
                <span className="visually-hidden">{t('recipe.favourite')}</span>
              </span>
            )}
            {shopping.isOnList(recipe) && (
              <span className="recipe-row__mark" title={t('recipe.shoppingList')}>
                <Icon name="basket" size={14} />
                <span className="visually-hidden">{t('recipe.shoppingList')}</span>
              </span>
            )}
          </span>
          {showSummary && <span className="recipe-row__summary">{localized(recipe.summary)}</span>}
          <span className="recipe-row__meta">
            {folders.length > 0 && <>{folders.join(' › ')} · </>}
            {t('book.totalTime', { count: recipe.prepMinutes + recipe.cookMinutes })}
            {matchedIngredients.length > 0 && (
              <> · {t('search.uses', { ingredients: matchedIngredients.map(localized).join(', ') })}</>
            )}
          </span>
        </span>
        <span className="recipe-row__leader" aria-hidden="true" />
        {page !== null && <span className="recipe-row__page numbers">{t('book.page', { page })}</span>}
      </BookLink>
    </li>
  )
}
