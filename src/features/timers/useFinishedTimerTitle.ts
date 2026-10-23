import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { KitchenTimer } from '@/lib/timers'
import { useLocalized } from '@/features/settings/useLanguage'

/** Puts a finished timer in the tab title, so it is noticed even when the cookbook tab is in the background. */
export function useFinishedTimerTitle(timers: KitchenTimer[]) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const finished = timers.find((timer) => timer.state.kind === 'finished')
  const finishedLabel = finished ? localized(finished.label) : null

  useEffect(() => {
    if (!finishedLabel) return
    const original = document.title
    document.title = t('timer.finishedTitle', { label: finishedLabel })
    return () => {
      document.title = original
    }
  }, [finishedLabel, t])
}
