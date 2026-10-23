import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { formatClock, remainingMs, type KitchenTimer } from '@/lib/timers'
import { useLocalized } from '@/features/settings/useLanguage'
import { timerStore } from './timer-store'
import { useFinishedTimerTitle } from './useFinishedTimerTitle'
import { useNow, useTimers } from './useTimers'
import './timers.css'

/** Every running timer, on every page, so nothing burns while you look at another recipe. */
export function TimerTray() {
  const { t } = useTranslation()
  const timers = useTimers()
  const now = useNow(timers.some((timer) => timer.state.kind === 'running'))
  useFinishedTimerTitle(timers)
  if (timers.length === 0) return null
  return (
    <section className="timer-tray" aria-label={t('timer.trayLabel')}>
      <ul className="timer-tray__list">
        {timers.map((timer) => (
          <TimerTicket key={timer.id} timer={timer} now={now} />
        ))}
      </ul>
    </section>
  )
}

function TimerTicket({ timer, now }: { timer: KitchenTimer; now: number }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const label = localized(timer.label)
  const finished = timer.state.kind === 'finished'
  return (
    <li className={`timer-ticket timer-ticket--${timer.state.kind}`} role={finished ? 'alert' : undefined}>
      <Link to={timer.path} className="timer-ticket__link">
        <span className="timer-ticket__clock numbers">{finished ? t('timer.done') : formatClock(remainingMs(timer, now))}</span>
        <span className="timer-ticket__label">{label}</span>
        <span className="timer-ticket__recipe">{localized(timer.recipeTitle)}</span>
      </Link>
      {timer.state.kind === 'running' && (
        <button type="button" className="icon-button" onClick={() => timerStore.pause(timer.id)} aria-label={t('timer.pause', { label })}>
          <Icon name="pause" size={20} />
        </button>
      )}
      {timer.state.kind === 'paused' && (
        <button type="button" className="icon-button" onClick={() => timerStore.resume(timer.id)} aria-label={t('timer.resume', { label })}>
          <Icon name="play" size={20} />
        </button>
      )}
      <button
        type="button"
        className="icon-button"
        onClick={() => timerStore.remove(timer.id)}
        aria-label={finished ? t('timer.stop') : t('timer.remove', { label })}
      >
        <Icon name="close" size={20} />
      </button>
    </li>
  )
}
