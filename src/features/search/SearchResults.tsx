import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { searchRecipes } from '@/lib/search'
import { searchIndex } from '@/features/book/book-data'
import { RecipeRow } from '@/features/book/RecipeRow'
import '@/features/book/book.css'

export function SearchResults({ query }: { query: string }) {
  const { t } = useTranslation()
  const hits = useMemo(() => searchRecipes(searchIndex, query), [query])
  const trimmed = query.trim()

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
      <section className="search-page">
        <h1 className="search-page__title">{t('search.noResults', { query: trimmed })}</h1>
        <p className="search-page__hint">{t('search.noResultsHint')}</p>
      </section>
    )
  }

  return (
    <section className="search-page">
      <h1 className="search-page__title" aria-live="polite">
        {t('search.resultCount', { count: hits.length, query: trimmed })}
      </h1>
      <ol className="recipe-rows">
        {hits.map((hit) => (
          <RecipeRow
            key={`${hit.recipe.chapterSlug}/${hit.recipe.slug}`}
            recipe={hit.recipe}
            matchedIngredients={hit.matchedIngredients}
          />
        ))}
      </ol>
    </section>
  )
}
