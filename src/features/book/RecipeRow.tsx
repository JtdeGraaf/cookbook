import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import type { Recipe } from '@/lib/book'
import type { LocalizedText } from '@/lib/recipe-rules'
import { useLocalized } from '@/features/settings/useLanguage'
import { pageOf } from './book-data'
import './book.css'

type RecipeRowProps = {
  recipe: Recipe
  /** Shown under the title in search results: which ingredients matched. */
  matchedIngredients?: LocalizedText[]
  /** Folder pages add a line of the summary under the title. */
  showSummary?: boolean
  /** Rows near the top load their photo straight away instead of waiting to be scrolled to. */
  eager?: boolean
}

/** One line of the table of contents: thumbnail, title, time, dotted leader, page number. */
export function RecipeRow({ recipe, matchedIngredients = [], showSummary = false, eager = false }: RecipeRowProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const page = pageOf(recipe.path)
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
          <span className="recipe-row__thumb recipe-row__thumb--empty" aria-hidden="true">
            {localized(recipe.title).charAt(0)}
          </span>
        )}
        <span className="recipe-row__text">
          <span className="recipe-row__title">{localized(recipe.title)}</span>
          {showSummary && <span className="recipe-row__summary">{localized(recipe.summary)}</span>}
          <span className="recipe-row__meta">
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
