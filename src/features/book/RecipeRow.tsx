import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/lib/book'
import type { LocalizedText } from '@/lib/recipe-rules'
import { useLocalized } from '@/features/settings/useLanguage'
import { recipePage } from './book-data'

type RecipeRowProps = {
  recipe: Recipe
  /** Shown under the title in search results: which ingredients matched. */
  matchedIngredients?: LocalizedText[]
}

/** One line of the table of contents: thumbnail, title, time, dotted leader, page number. */
export function RecipeRow({ recipe, matchedIngredients = [] }: RecipeRowProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const page = recipePage(recipe)
  return (
    <li className="recipe-row">
      <Link
        to="/$chapter/$recipe"
        params={{ chapter: recipe.chapterSlug, recipe: recipe.slug }}
        className="recipe-row__link"
      >
        <img
          className="recipe-row__thumb"
          src={recipe.cover.file.src}
          srcSet={recipe.cover.file.srcset}
          sizes="96px"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="recipe-row__text">
          <span className="recipe-row__title">{localized(recipe.title)}</span>
          <span className="recipe-row__meta">
            {t('book.totalTime', { count: recipe.prepMinutes + recipe.cookMinutes })}
            {matchedIngredients.length > 0 && (
              <> · {t('search.uses', { ingredients: matchedIngredients.map(localized).join(', ') })}</>
            )}
          </span>
        </span>
        <span className="recipe-row__leader" aria-hidden="true" />
        {page !== null && <span className="recipe-row__page numbers">{t('book.page', { page })}</span>}
      </Link>
    </li>
  )
}
