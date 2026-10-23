import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { MAX_SERVINGS, MIN_SERVINGS } from '@/lib/recipe-rules'

type ServingsStepperProps = { servings: number; onChange: (servings: number) => void }

export function ServingsStepper({ servings, onChange }: ServingsStepperProps) {
  const { t } = useTranslation()
  return (
    <div className="servings" role="group" aria-label={t('recipe.servings')}>
      <button
        type="button"
        className="servings__button"
        onClick={() => onChange(servings - 1)}
        disabled={servings <= MIN_SERVINGS}
        aria-label={t('recipe.fewerServings')}
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
        aria-label={t('recipe.moreServings')}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  )
}
