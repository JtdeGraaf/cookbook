import { LANGUAGES, type Language, type LocalizedText } from './recipe-rules.ts'

/** The Dutch domain opens the book in Dutch. index.html reads this list too, through the domain-language build plugin. */
export const DUTCH_HOSTNAMES = ['kookboek.graaf.dev']

/** One home-screen manifest per language, so an installed icon is named in the language of its domain. */
export const MANIFEST_PATHS: Record<Language, string> = { en: '/manifest.webmanifest', nl: '/manifest.nl.webmanifest' }

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
