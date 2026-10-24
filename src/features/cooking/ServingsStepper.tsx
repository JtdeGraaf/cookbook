import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { MAX_SERVINGS, MIN_SERVINGS } from '@/lib/recipe-rules'

type ServingsStepperProps = {
  servings: number
  onChange: (servings: number) => void
  /** Names the recipe in the labels, for pages that show several steppers at once. */
  recipeTitle?: string
}

export function ServingsStepper({ servings, onChange, recipeTitle }: ServingsStepperProps) {
  const labels = useServingsLabels(recipeTitle)
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
        {t('recipe.forPeople', { count: servings })}
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

function useServingsLabels(recipeTitle: string | undefined) {
  const { t } = useTranslation()
  if (recipeTitle === undefined) {
    return { group: t('recipe.servings'), fewer: t('recipe.fewerServings'), more: t('recipe.moreServings') }
  }
  return {
    group: t('recipe.servingsFor', { title: recipeTitle }),
    fewer: t('recipe.fewerServingsFor', { title: recipeTitle }),
    more: t('recipe.moreServingsFor', { title: recipeTitle }),
  }
}
