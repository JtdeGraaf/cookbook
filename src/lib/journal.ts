import { z } from 'zod/mini'
import type { Language } from './recipe-rules'

/** What the cook remembers about one recipe: when they made it and notes for next time. */
export type RecipeJournal = {
  /** Local calendar dates as "YYYY-MM-DD", newest first, each date once. */
  cookedOn: string[]
  note: string
}

export const EMPTY_JOURNAL: RecipeJournal = { cookedOn: [], note: '' }

/** Today's date in the cook's own time zone, as "YYYY-MM-DD". */
export function localDate(now: Date): string {
  const twoDigits = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`
}

/** Cooking the same recipe twice on one day counts once. */
export function recordCooked(journal: RecipeJournal, date: string): RecipeJournal {
  if (journal.cookedOn.includes(date)) return journal
  return { ...journal, cookedOn: [date, ...journal.cookedOn].sort().reverse() }
}

export function changeNote(journal: RecipeJournal, note: string): RecipeJournal {
  return { ...journal, note }
}

/** British English, so English dates read day first like Dutch ones. */
const DATE_LOCALES: Record<Language, string> = { en: 'en-GB', nl: 'nl-NL' }

/** "23 October 2026" or "23 oktober 2026". Noon, so no time zone shifts the day. */
export function formatCookedDate(date: string, language: Language): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[language], { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${date}T12:00`),
  )
}

export function journalKey(recipePath: string): string {
  return `journal:${recipePath}`
}

const savedJournalSchema = z.strictObject({
  cookedOn: z.array(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/))),
  note: z.string(),
})

export function parseSavedJournal(value: unknown): RecipeJournal | null {
  const result = savedJournalSchema.safeParse(value)
  return result.success ? result.data : null
}
