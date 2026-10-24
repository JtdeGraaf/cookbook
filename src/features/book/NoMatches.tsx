import { useTranslation } from 'react-i18next'
import { NO_FILTERS, hasFilters, type RecipeFilters } from '@/lib/filters'

type NoMatchesProps = { filters: RecipeFilters; onFiltersChange: (filters: RecipeFilters) => void }

/** Shown instead of a listing when the filters leave nothing, with a way to clear them. */
export function NoMatches({ filters, onFiltersChange }: NoMatchesProps) {
  const { t } = useTranslation()
  return (
    <div className="contents__empty">
      <p>{t('filters.noMatches')}</p>
      {hasFilters(filters) && (
        <button type="button" className="button button--quiet" onClick={() => onFiltersChange(NO_FILTERS)}>
          {t('filters.clear')}
        </button>
      )}
    </div>
  )
}
