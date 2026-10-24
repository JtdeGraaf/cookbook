import { LANGUAGES, type Language, type LocalizedText } from './recipe-rules'

/** The Dutch domain opens the book in Dutch. */
const DUTCH_HOSTNAMES = ['kookboek.graaf.dev']

export function parseLanguage(value: unknown): Language | null {
  return LANGUAGES.find((language) => language === value) ?? null
}

/** A shared link's language wins, then the reader's own choice, the domain, the browser; English as the last resort. */
export function pickStartingLanguage(options: {
  /** From a shared link's `?lang=`. */
  linked: Language | null
  saved: Language | null
  hostname: string
  browserLanguages: readonly string[]
}): Language {
  if (options.linked) return options.linked
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
