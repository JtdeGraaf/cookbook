import { useTranslation } from 'react-i18next'
import { saveLanguage } from '@/i18n/i18n'
import { parseLanguage, pickText } from '@/lib/language'
import type { Language, LocalizedText } from '@/lib/recipe-rules'

export function useLanguage() {
  const { i18n } = useTranslation()
  const language: Language = parseLanguage(i18n.resolvedLanguage) ?? 'en'

  function changeLanguage(next: Language) {
    saveLanguage(next)
    document.documentElement.lang = next
    void i18n.changeLanguage(next)
  }

  return { language, changeLanguage }
}

/** Picks the reader's language out of a recipe text. */
export function useLocalized(): (text: LocalizedText) => string {
  const { language } = useLanguage()
  return (text) => pickText(text, language)
}
