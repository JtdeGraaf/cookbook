import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Photo } from '@/components/Photo'
import { recipeViewPath, type Recipe } from '@/lib/book'
import { StepTimerButton } from '@/features/timers/StepTimerButton'
import { IngredientChips } from './IngredientChips'
import { PhaseHead } from './PhaseHead'
import { Point } from './Point'
import { StepText } from './StepText'
import type { RecipeProgressControls } from './useRecipeProgress'

type CookStepProps = { recipe: Recipe; controls: RecipeProgressControls; stepNumber: number }

/** One cooking step in focus, big enough to read from the stove. */
export function CookStep({ recipe, controls, stepNumber }: CookStepProps) {
  const { t } = useTranslation()
  const step = recipe.cook[stepNumber - 1]
  const total = recipe.cook.length

  return (
    <section className="cook">
      <PhaseHead recipe={recipe} title={t('cook.stepOf', { step: stepNumber, total })}>
        <ol className="cook__dots">
          {recipe.cook.map((_step, index) => (
            <li key={index}>
              <BookLink
                path={recipeViewPath(recipe, { name: 'cook', stepNumber: index + 1 })}
                className="cook__dot"
                aria-label={t('cook.stepOf', { step: index + 1, total })}
                aria-current={index + 1 === stepNumber ? 'step' : undefined}
                data-past={index + 1 < stepNumber}
              />
            </li>
          ))}
        </ol>
      </PhaseHead>

      <article className="cook-step" key={stepNumber}>
        <span className="cook-step__number numbers" aria-hidden="true">
          {stepNumber}
        </span>
        <div className="cook-step__body">
          <StepText step={step} className="cook-step__text" />
          <IngredientChips recipe={recipe} step={step} servings={controls.servings} />
          {step.timer && <StepTimerButton recipe={recipe} phase="cook" stepNumber={stepNumber} timer={step.timer} />}
          {step.tip && <Point tip={step.tip} />}
          {step.image && (
            <Photo picture={step.image} sizes="(min-width: 1024px) 600px, 100vw" className="cook-step__photo" />
          )}
        </div>
      </article>

    </section>
  )
}
