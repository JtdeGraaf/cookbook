import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { TIME_LIMITS, allTags, tagKey, type RecipeFilters } from '@/lib/filters'
import { useLocalized } from '@/features/settings/useLanguage'
import { book } from './book-data'
import { useSurpriseRecipe } from './useSurpriseRecipe'

type RecipeFilterBarProps = {
  filters: RecipeFilters
  onFiltersChange: (filters: RecipeFilters) => void
  /** What "Surprise me" picks from: the recipes the filters let through. */
  matchingRecipes: Recipe[]
}

/** Quick filters as chips that switch on and off, plus a button that opens a random matching recipe. */
export function RecipeFilterBar({ filters, onFiltersChange, matchingRecipes }: RecipeFilterBarProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const surprise = useSurpriseRecipe(matchingRecipes)
  const timeLabels = { 30: t('filters.under30'), 60: t('filters.under60') }
  return (
    <div className="filter-bar" role="group" aria-label={t('filters.label')}>
      <ul className="filter-bar__chips">
        {TIME_LIMITS.map((limit) => (
          <li key={limit}>
            <button
              type="button"
              className="chip-toggle"
              aria-pressed={filters.maxMinutes === limit}
              onClick={() => onFiltersChange({ ...filters, maxMinutes: filters.maxMinutes === limit ? null : limit })}
            >
              {timeLabels[limit]}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="chip-toggle"
            aria-pressed={filters.favouritesOnly}
            onClick={() => onFiltersChange({ ...filters, favouritesOnly: !filters.favouritesOnly })}
          >
            <Icon name={filters.favouritesOnly ? 'heartFilled' : 'heart'} size={16} />
            {t('filters.favourites')}
          </button>
        </li>
        {allTags(book).map((tag) => (
          <li key={tagKey(tag)}>
            <button
              type="button"
              className="chip-toggle"
              aria-pressed={filters.tag === tagKey(tag)}
              onClick={() => onFiltersChange({ ...filters, tag: filters.tag === tagKey(tag) ? null : tagKey(tag) })}
            >
              {localized(tag)}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button filter-bar__surprise" onClick={surprise} disabled={matchingRecipes.length === 0}>
        <Icon name="shuffle" size={20} />
        {t('filters.surprise')}
      </button>
    </div>
  )
}
