import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { usePageTitle } from '@/components/usePageTitle'
import { searchRecipes } from '@/lib/search'
import { searchIndex } from '@/features/book/book-data'
import { RecipeRow } from '@/features/book/RecipeRow'
import '@/features/book/book.css'

/** Search results as contents rows, each with the folders it is in, so you know where in the book it lives. */
export function SearchResults({ query }: { query: string }) {
  const { t } = useTranslation()
  const hits = useMemo(() => searchRecipes(searchIndex, query), [query])
  const trimmed = query.trim()
  usePageTitle(trimmed === '' ? t('search.title') : `${t('search.title')}: ${trimmed}`)

  if (trimmed === '') {
    return (
      <section className="search-page">
        <h1 className="search-page__title">{t('search.title')}</h1>
        <p className="search-page__hint">{t('search.empty')}</p>
      </section>
    )
  }

  if (hits.length === 0) {
    return (
      <EmptyState
        title={t('search.noResults', { query: trimmed })}
        hint={t('search.noResultsHint')}
        action={
          <Link to="/" className="button button--quiet">
            {t('search.noResultsAction')}
          </Link>
        }
      />
    )
  }

  return (
    <section className="search-page">
      <h1 className="search-page__title" aria-live="polite">
        {t('search.resultCount', { count: hits.length, query: trimmed })}
      </h1>
      <ol className="recipe-rows">
        {hits.map((hit) => (
          <RecipeRow key={hit.recipe.path} recipe={hit.recipe} matchedIngredients={hit.matchedIngredients} showFolder />
        ))}
      </ol>
    </section>
  )
}
