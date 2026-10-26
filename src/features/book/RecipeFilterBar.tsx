import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { NO_FILTERS, TIME_LIMITS, hasFilters, tagKey, type RecipeFilters } from '@/lib/filters'
import type { LocalizedText } from '@/lib/recipe-rules'
import { useLocalized } from '@/features/settings/useLanguage'
import { useSurpriseRecipe } from './useSurpriseRecipe'

type RecipeFilterBarProps = {
  filters: RecipeFilters
  onFiltersChange: (filters: RecipeFilters) => void
  /** What "Surprise me" picks from: the recipes the filters let through. */
  matchingRecipes: Recipe[]
  /** The tags offered: only those used by the recipes on this page. */
  tags: LocalizedText[]
  /** False on a page of drinks, which have no time to filter by. */
  offerTimeLimits: boolean
}

/**
 * Quick filters as chips, the tags folded behind one "Tags" chip so the row stays short, and a button that opens a
 * random matching recipe. While any filter is on, a line says how many recipes match and offers to clear them.
 */
export function RecipeFilterBar({ filters, onFiltersChange, matchingRecipes, tags, offerTimeLimits }: RecipeFilterBarProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const surprise = useSurpriseRecipe(matchingRecipes)
  const [tagsOpen, setTagsOpen] = useState(false)
  const activeTag = tags.find((tag) => tagKey(tag) === filters.tag) ?? null
  const timeLabels = { 30: t('filters.under30'), 60: t('filters.under60') }
  const toggleTag = (tag: LocalizedText) =>
    onFiltersChange({ ...filters, tag: filters.tag === tagKey(tag) ? null : tagKey(tag) })

  return (
    <div className="filter-bar" role="group" aria-label={t('filters.label')}>
      <div className="filter-bar__row">
        <ul className="filter-bar__chips">
          {offerTimeLimits &&
            TIME_LIMITS.map((limit) => (
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
          {activeTag && !tagsOpen && (
            <li>
              <button type="button" className="chip-toggle" aria-pressed="true" onClick={() => toggleTag(activeTag)}>
                {localized(activeTag)}
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className="chip-toggle chip-toggle--more"
              aria-expanded={tagsOpen}
              aria-controls="filter-tags"
              onClick={() => setTagsOpen((open) => !open)}
            >
              {t('filters.tags')}
              <Icon name={tagsOpen ? 'down' : 'right'} size={16} />
            </button>
          </li>
        </ul>
        <button
          type="button"
          className="button filter-bar__surprise"
          onClick={surprise}
          disabled={matchingRecipes.length === 0}
        >
          <Icon name="shuffle" size={20} />
          {t('filters.surprise')}
        </button>
      </div>

      {tagsOpen && (
        <ul id="filter-tags" className="filter-bar__tags">
          {tags.map((tag) => (
            <li key={tagKey(tag)}>
              <button
                type="button"
                className="chip-toggle"
                aria-pressed={filters.tag === tagKey(tag)}
                onClick={() => toggleTag(tag)}
              >
                {localized(tag)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasFilters(filters) && (
        <p className="filter-bar__summary" aria-live="polite">
          {t('filters.summary', { count: matchingRecipes.length })}
          <button type="button" className="text-button" onClick={() => onFiltersChange(NO_FILTERS)}>
            <Icon name="close" size={16} />
            {t('filters.clear')}
          </button>
        </p>
      )}
    </div>
  )
}
