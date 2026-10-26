import { useTranslation } from 'react-i18next'
import type { Step } from '@/lib/book'
import { Point } from './Point'
import { StepText } from './StepText'

/** The numbered method as the spread shows it, each step with its Point. */
export function MethodSteps({ steps }: { steps: Step[] }) {
  const { t } = useTranslation()
  return (
    <section className="method" aria-labelledby="method-title">
      <h2 id="method-title" className="method__title">
        {t('recipe.methodTitle')}
      </h2>
      <ol className="method__list">
        {steps.map((step, index) => (
          <li key={index} className="method__step">
            <span className="method__number numbers" aria-hidden="true">
              {index + 1}
            </span>
            <div className="method__body">
              <StepText step={step} />
              {step.tip && <Point tip={step.tip} />}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
