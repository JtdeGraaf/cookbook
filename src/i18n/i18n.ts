import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { parseLanguage, pickStartingLanguage } from '@/lib/language'
import type { Language } from '@/lib/recipe-rules'
import { readSaved, save } from '@/lib/storage'
import en from './locales/en/translation.json'
import nl from './locales/nl/translation.json'

export const resources = { en: { translation: en }, nl: { translation: nl } } as const

const LANGUAGE_KEY = 'language'

export function startingLanguage(): Language {
  const linked = parseLanguage(new URLSearchParams(window.location.search).get('lang'))
  // Opening a shared link in another language switches the book, the same as tapping EN or NL would.
  if (linked) saveLanguage(linked)
  return pickStartingLanguage({
    linked,
    saved: readSaved(LANGUAGE_KEY, parseLanguage),
    hostname: window.location.hostname,
    browserLanguages: navigator.languages,
  })
}

export function saveLanguage(language: Language): void {
  save(LANGUAGE_KEY, language)
}

export function setUpTranslations(language: Language) {
  document.documentElement.lang = language
  return i18next.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
}
