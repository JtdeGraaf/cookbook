import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { MAX_SERVINGS, MIN_SERVINGS } from '@/lib/recipe-rules'

type ServingsStepperProps = {
  /** A dish counts people, a drink counts glasses. */
  kind: Recipe['kind']
  servings: number
  onChange: (servings: number) => void
  /** Names the recipe in the labels, for pages that show several steppers at once. */
  recipeTitle?: string
}

export function ServingsStepper({ kind, servings, onChange, recipeTitle }: ServingsStepperProps) {
  const labels = useServingsLabels(kind, recipeTitle)
  const { t } = useTranslation()
  return (
    <div className="servings" role="group" aria-label={labels.group}>
      <button
        type="button"
        className="servings__button"
        onClick={() => onChange(servings - 1)}
        disabled={servings <= MIN_SERVINGS}
        aria-label={labels.fewer}
      >
        <Icon name="minus" size={18} />
      </button>
      <output className="servings__count numbers" aria-live="polite">
        {kind === 'drink' ? t('recipe.forDrinks', { count: servings }) : t('recipe.forPeople', { count: servings })}
      </output>
      <button
        type="button"
        className="servings__button"
        onClick={() => onChange(servings + 1)}
        disabled={servings >= MAX_SERVINGS}
        aria-label={labels.more}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  )
}

/** The stepper's labels: about people for a dish, about glasses for a drink. */
const LABEL_KEYS = {
  dish: {
    group: 'recipe.servings',
    fewer: 'recipe.fewerServings',
    more: 'recipe.moreServings',
    groupFor: 'recipe.servingsFor',
    fewerFor: 'recipe.fewerServingsFor',
    moreFor: 'recipe.moreServingsFor',
  },
  drink: {
    group: 'recipe.drinks',
    fewer: 'recipe.fewerDrinks',
    more: 'recipe.moreDrinks',
    groupFor: 'recipe.drinksFor',
    fewerFor: 'recipe.fewerDrinksFor',
    moreFor: 'recipe.moreDrinksFor',
  },
} as const

function useServingsLabels(kind: Recipe['kind'], recipeTitle: string | undefined) {
  const { t } = useTranslation()
  const keys = LABEL_KEYS[kind]
  if (recipeTitle === undefined) return { group: t(keys.group), fewer: t(keys.fewer), more: t(keys.more) }
  return {
    group: t(keys.groupFor, { title: recipeTitle }),
    fewer: t(keys.fewerFor, { title: recipeTitle }),
    more: t(keys.moreFor, { title: recipeTitle }),
  }
}
