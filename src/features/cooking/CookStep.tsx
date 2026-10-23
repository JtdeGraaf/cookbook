import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { recipeViewPath, type Recipe } from '@/lib/book'
import { StepTimerButton } from '@/features/timers/StepTimerButton'
import { useLocalized } from '@/features/settings/useLanguage'
import { IngredientChips } from './IngredientChips'
import { Point } from './Point'
import type { RecipeProgressControls } from './useRecipeProgress'
import { useStepNavigation } from './useStepNavigation'

type CookStepProps = { recipe: Recipe; controls: RecipeProgressControls; stepNumber: number }

/** One cooking step in focus, big enough to read from the stove. */
export function CookStep({ recipe, controls, stepNumber }: CookStepProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const navigation = useStepNavigation(recipe, stepNumber)
  const step = recipe.cook[stepNumber - 1]
  const total = recipe.cook.length

  return (
    <section className="cook">
      <header className="phase-head">
        <BookLink path={recipe.path} className="phase-head__back">
          <Icon name="left" size={18} />
          {localized(recipe.title)}
        </BookLink>
        <p className="cook__position numbers">{t('cook.stepOf', { step: stepNumber, total })}</p>
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
      </header>

      <article className="cook-step" key={stepNumber}>
        <span className="cook-step__number numbers" aria-hidden="true">
          {stepNumber}
        </span>
        <div className="cook-step__body">
          <p className="cook-step__text">{localized(step.text)}</p>
          <IngredientChips recipe={recipe} step={step} servings={controls.servings} />
          {step.timer && <StepTimerButton recipe={recipe} phase="cook" stepNumber={stepNumber} timer={step.timer} />}
          {step.tip && <Point tip={step.tip} />}
          {step.image && (
            <Photo picture={step.image} sizes="(min-width: 1024px) 600px, 100vw" className="cook-step__photo" />
          )}
        </div>
      </article>

      <nav className="step-nav">
        <button type="button" className="button button--quiet" onClick={navigation.goToPrevious}>
          <Icon name="left" />
          {navigation.isFirst ? t('cook.backToPrep') : t('cook.previous')}
        </button>
        <button type="button" className="button" onClick={navigation.goToNext}>
          {navigation.isLast ? t('cook.finish') : t('cook.next')}
          <Icon name={navigation.isLast ? 'check' : 'right'} />
        </button>
      </nav>
    </section>
  )
}
