import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { Tick } from '@/components/Tick'
import type { Recipe } from '@/lib/book'
import { StepTimerButton } from '@/features/timers/StepTimerButton'
import { useLocalized } from '@/features/settings/useLanguage'
import { IngredientChips } from './IngredientChips'
import { Point } from './Point'
import type { RecipeProgressControls } from './useRecipeProgress'

type PrepChecklistProps = { recipe: Recipe; controls: RecipeProgressControls }

/** Mise en place: every task before the heat, ticked off one by one. Cooking unlocks when all are done. */
export function PrepChecklist({ recipe, controls }: PrepChecklistProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const done = controls.progress.donePrepSteps
  return (
    <section className="prep">
      <header className="phase-head">
        <Link to="/$chapter/$recipe" params={{ chapter: recipe.chapterSlug, recipe: recipe.slug }} className="phase-head__back">
          <Icon name="left" size={18} />
          {localized(recipe.title)}
        </Link>
        <h1 className="phase-head__title">{t('recipe.prepTitle')}</h1>
        <p className="phase-head__intro">{t('recipe.prepIntro')}</p>
        <p className="prep__progress numbers" aria-live="polite">
          {t('prep.progress', { done: done.length, total: recipe.prep.length })}
        </p>
        <ol className="prep__meter" aria-hidden="true">
          {recipe.prep.map((_step, index) => (
            <li key={index} className={done.includes(index) ? 'is-done' : undefined} />
          ))}
        </ol>
      </header>

      <ol className="prep__tasks">
        {recipe.prep.map((step, index) => (
          <li key={index} className="prep-task" data-done={done.includes(index)}>
            <label className="prep-task__check">
              <Tick large checked={done.includes(index)} onChange={() => controls.togglePrepStep(index)} />
              <span className="prep-task__text">{localized(step.text)}</span>
            </label>
            <div className="prep-task__extras">
              <IngredientChips recipe={recipe} step={step} servings={controls.servings} />
              {step.timer && <StepTimerButton recipe={recipe} phase="prep" stepNumber={index + 1} timer={step.timer} />}
              {step.tip && <Point tip={step.tip} />}
            </div>
          </li>
        ))}
      </ol>

      <footer className="phase-foot">
        {controls.prepDone ? (
          <>
            <p className="phase-foot__note">{t('prep.ready')}</p>
            <Link
              to="/$chapter/$recipe/cook/$step"
              params={{ chapter: recipe.chapterSlug, recipe: recipe.slug, step: '1' }}
              className="button"
            >
              {t('recipe.startCooking')}
              <Icon name="right" />
            </Link>
          </>
        ) : (
          <>
            <p className="phase-foot__note">{t('prep.locked')}</p>
            <span className="button" aria-disabled="true">
              {t('recipe.startCooking')}
              <Icon name="right" />
            </span>
          </>
        )}
      </footer>
    </section>
  )
}
