import { useTranslation } from 'react-i18next'
import { Tick } from '@/components/Tick'
import type { Recipe } from '@/lib/book'
import { StepTimerButton } from '@/features/timers/StepTimerButton'
import { useLocalized } from '@/features/settings/useLanguage'
import { IngredientChips } from './IngredientChips'
import { PhaseHead } from './PhaseHead'
import { prepTaskTickId } from './prep-task-focus'
import { Point } from './Point'
import type { RecipeProgressControls } from './useRecipeProgress'

type PrepChecklistProps = { recipe: Recipe; controls: RecipeProgressControls }

/** Mise en place: every task before cooking, ticked off one by one. Cooking unlocks when all are done. */
export function PrepChecklist({ recipe, controls }: PrepChecklistProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const done = controls.progress.donePrepSteps
  return (
    <section className="prep">
      <PhaseHead recipe={recipe} title={t('recipe.prepTitle')}>
        <p className="phase-head__intro">{t('recipe.prepIntro')}</p>
        <p className="prep__progress numbers" aria-live="polite">
          {t('prep.progress', { done: done.length, total: recipe.prep.length })}
        </p>
        <ol className="prep__meter" aria-hidden="true">
          {recipe.prep.map((_step, index) => (
            <li key={index} className={done.includes(index) ? 'is-done' : undefined} />
          ))}
        </ol>
      </PhaseHead>

      <ol className="prep__tasks">
        {recipe.prep.map((step, index) => (
          <li key={index} className="prep-task" data-done={done.includes(index)}>
            <label className="prep-task__check">
              <Tick large id={prepTaskTickId(index)} checked={done.includes(index)} onChange={() => controls.togglePrepStep(index)} />
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

      <p id="prep-locked" className="phase-foot__note" aria-live="polite">
        {controls.prepDone ? t('prep.ready') : t('prep.locked')}
      </p>
    </section>
  )
}
