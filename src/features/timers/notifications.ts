/**
 * Phone-style notifications for timers that finish while the cook is in another app or tab. Without a server they
 * can only be shown while the browser still runs the page; iPhone and iPad only allow them from the Home Screen.
 */
import i18next from 'i18next'
import { parseLanguage, pickText } from '@/lib/language'
import { readSaved, save } from '@/lib/storage'
import type { KitchenTimer } from '@/lib/timers'

const ASKED_KEY = 'notifications-asked'
const VIBRATE_PATTERN = [200, 100, 200, 100, 200]

// The DOM types leave out `vibrate`, which service-worker notifications on Android still use.
type PhoneNotificationOptions = NotificationOptions & { vibrate: number[] }

/** Shown without a service worker (development), so Stop can still close them. */
const pageNotifications = new Map<string, Notification>()

function canNotify(): boolean {
  return typeof Notification !== 'undefined'
}

/** Asks once, at the first timer the cook starts. A refused or dismissed question is never asked again. */
export function askToNotifyOnce(): void {
  if (!canNotify() || Notification.permission !== 'default') return
  if (readSaved(ASKED_KEY, (value) => (value === true ? true : null))) return
  save(ASKED_KEY, true)
  void Notification.requestPermission()
}

/** Only while the page is out of sight: on screen, the banner and the alarm already say it. */
export function notifyFinished(timers: KitchenTimer[]): void {
  if (!canNotify() || Notification.permission !== 'granted' || document.visibilityState !== 'hidden') return
  for (const timer of timers) void showNotification(timer)
}

export function closeNotifications(timerIds: string[]): void {
  if (!canNotify()) return
  for (const id of timerIds) {
    pageNotifications.get(id)?.close()
    pageNotifications.delete(id)
    void navigator.serviceWorker?.getRegistration().then((registration) =>
      registration?.getNotifications({ tag: id }).then((shown) => shown.forEach((notification) => notification.close())),
    )
  }
}

async function showNotification(timer: KitchenTimer): Promise<void> {
  const language = parseLanguage(i18next.resolvedLanguage) ?? 'en'
  const title = i18next.t('timer.notificationTitle', { label: pickText(timer.label, language) })
  const options: PhoneNotificationOptions = {
    body: i18next.t('timer.notificationBody', { recipe: pickText(timer.recipeTitle, language) }),
    // One per timer: the same timer finishing in two open tabs shows once.
    tag: timer.id,
    icon: '/icon-192.png',
    lang: language,
    vibrate: VIBRATE_PATTERN,
    requireInteraction: true,
    data: { path: timer.path },
  }
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) return registration.showNotification(title, options)
  pageNotifications.set(timer.id, new Notification(title, options))
}
