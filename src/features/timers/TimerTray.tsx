import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { setTitleAlarm } from '@/components/page-title'
import { formatClock, remainingMs, sortForShelf, type KitchenTimer } from '@/lib/timers'
import { useLocalized } from '@/features/settings/useLanguage'
import { isSoundOn, onSoundChange } from './alarm'
import { timerStore } from './timer-store'
import { useNow, useTimers } from './useTimers'
import './timers.css'

/**
 * The timer shelf on every page. A ringing timer becomes a wide banner that can't scroll out of sight; the rest
 * line up by which rings first. The timer of the step on screen is left off, since the step already shows it.
 */
export function TimerTray() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const timers = useTimers()
  const now = useNow(timers.some((timer) => timer.state.kind === 'running'))
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const soundOn = useSyncExternalStore(onSoundChange, isSoundOn)

  const sorted = sortForShelf(timers, now)
  const ringing = sorted.filter((timer) => timer.state.kind === 'finished')
  // A cooking step shows its own timer, so the shelf leaves it off there. Prep timers all share one page and some
  // are scrolled out of view, so they always stay on the shelf.
  const shownOnPage = (timer: KitchenTimer) => timer.path === pathname && !pathname.endsWith('/prep')
  const waiting = sorted.filter((timer) => timer.state.kind !== 'finished' && !shownOnPage(timer))
  const needsSound = !soundOn && timers.some((timer) => timer.state.kind === 'running') && ringing.length === 0
  const firstRinging = ringing[0] ? localized(ringing[0].label) : null

  // A ringing timer also shows in the tab title, for when the book is in a background tab.
  useEffect(() => {
    setTitleAlarm(firstRinging ? t('timer.finishedTitle', { label: firstRinging }) : null)
  }, [firstRinging, t])

  if (ringing.length === 0 && waiting.length === 0 && !needsSound) return null
  return (
    <section className="timer-tray" aria-label={t('timer.trayLabel')}>
      {ringing.map((timer) => (
        <AlarmBanner key={timer.id} timer={timer} />
      ))}
      {waiting.length > 0 && (
        <ul className="timer-tray__list">
          {waiting.map((timer) => (
            <TimerTicket key={timer.id} timer={timer} now={now} />
          ))}
        </ul>
      )}
      {needsSound && (
        <p className="timer-tray__sound-hint">
          <Icon name="bell" size={16} />
          {t('timer.soundOff')}
        </p>
      )}
    </section>
  )
}

function AlarmBanner({ timer }: { timer: KitchenTimer }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <div className="alarm-banner" role="alert">
      <Icon name="bell" size={26} />
      <Link to={timer.path} className="alarm-banner__text">
        <strong>{t('timer.finishedBanner', { label: localized(timer.label) })}</strong>
        <span>{localized(timer.recipeTitle)}</span>
      </Link>
      <button type="button" className="alarm-banner__stop" onClick={() => timerStore.remove(timer.id)}>
        {t('timer.stop')}
      </button>
    </div>
  )
}

function TimerTicket({ timer, now }: { timer: KitchenTimer; now: number }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const label = localized(timer.label)
  return (
    <li className={`timer-ticket timer-ticket--${timer.state.kind}`}>
      <Link to={timer.path} className="timer-ticket__link">
        <span className="timer-ticket__clock numbers">{formatClock(remainingMs(timer, now))}</span>
        <span className="timer-ticket__label">{label}</span>
        <span className="timer-ticket__recipe">{localized(timer.recipeTitle)}</span>
      </Link>
      {timer.state.kind === 'running' ? (
        <button type="button" className="icon-button" onClick={() => timerStore.pause(timer.id)} aria-label={t('timer.pause', { label })}>
          <Icon name="pause" size={20} />
        </button>
      ) : (
        <button type="button" className="icon-button" onClick={() => timerStore.resume(timer.id)} aria-label={t('timer.resume', { label })}>
          <Icon name="play" size={20} />
        </button>
      )}
      <button type="button" className="icon-button" onClick={() => timerStore.remove(timer.id)} aria-label={t('timer.remove', { label })}>
        <Icon name="close" size={20} />
      </button>
    </li>
  )
}
