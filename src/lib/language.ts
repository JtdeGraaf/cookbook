import { LANGUAGES, type Language, type LocalizedText } from './recipe-rules'

/** The Dutch domain opens the book in Dutch. */
const DUTCH_HOSTNAMES = ['kookboek.graaf.dev']

export function parseLanguage(value: unknown): Language | null {
  return LANGUAGES.find((language) => language === value) ?? null
}

/** A language the reader picked wins; then the domain; then the browser; English when nothing matches. */
export function pickStartingLanguage(options: {
  saved: Language | null
  hostname: string
  browserLanguages: readonly string[]
}): Language {
  if (options.saved) return options.saved
  if (DUTCH_HOSTNAMES.includes(options.hostname)) return 'nl'
  const fromBrowser = options.browserLanguages
    .map((tag) => parseLanguage(tag.toLowerCase().split('-')[0]))
    .find((language) => language !== null)
  return fromBrowser ?? 'en'
}

export function pickText(text: LocalizedText, language: Language): string {
  return text[language]
}

export function otherLanguage(language: Language): Language {
  return language === 'en' ? 'nl' : 'en'
}
