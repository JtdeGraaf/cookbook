import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe, StepTimer } from '@/lib/book'
import { formatClock } from '@/lib/timers'
import { useLocalized } from '@/features/settings/useLanguage'
import { useStepTimer } from './useStepTimer'
import './timers.css'

type StepTimerButtonProps = { recipe: Recipe; phase: 'prep' | 'cook'; stepNumber: number; timer: StepTimer }

/** The kitchen timer printed on a step: start it, watch it, pause it, silence it. */
export function StepTimerButton(props: StepTimerButtonProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const stepTimer = useStepTimer(props)
  const label = localized(props.timer.label)
  const clock = formatClock(stepTimer.remaining)

  if (stepTimer.state === 'idle') {
    return (
      <button type="button" className="step-timer step-timer--idle" onClick={stepTimer.start}>
        <Icon name="timer" />
        <span className="step-timer__label">{label}</span>
        <span className="step-timer__clock numbers">{t('timer.start', { time: clock })}</span>
      </button>
    )
  }

  return (
    <div className={`step-timer step-timer--${stepTimer.state}`} role="timer">
      <Icon name={stepTimer.state === 'finished' ? 'bell' : 'timer'} />
      <span className="step-timer__label">{label}</span>
      <span className="step-timer__clock numbers">{stepTimer.state === 'finished' ? t('timer.done') : clock}</span>
      <span className="step-timer__controls">
        {stepTimer.state === 'running' && (
          <button type="button" className="icon-button" onClick={stepTimer.pause} aria-label={t('timer.pause', { label })}>
            <Icon name="pause" />
          </button>
        )}
        {stepTimer.state === 'paused' && (
          <button
            type="button"
            className="icon-button"
            onClick={stepTimer.resume}
            aria-label={t('timer.resume', { label })}
          >
            <Icon name="play" />
          </button>
        )}
        {stepTimer.state === 'finished' ? (
          <button type="button" className="step-timer__stop" onClick={stepTimer.remove}>
            {t('timer.stop')}
          </button>
        ) : (
          <button type="button" className="icon-button" onClick={stepTimer.start} aria-label={t('timer.restart')}>
            <Icon name="undo" />
          </button>
        )}
      </span>
    </div>
  )
}
