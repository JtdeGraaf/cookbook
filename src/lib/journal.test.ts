import { describe, expect, it } from 'vitest'
import { EMPTY_JOURNAL, formatCookedDate, localDate, parseSavedJournal, recordCooked, recordFinished } from './journal'

describe('recipe journal', () => {
  it('writes dates in the cook’s own calendar', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })

  it('keeps cooked dates newest first', () => {
    const journal = recordCooked(recordCooked(EMPTY_JOURNAL, '2026-10-01'), '2026-10-23')

    expect(journal.cookedOn).toEqual(['2026-10-23', '2026-10-01'])
  })

  it('counts cooking twice on one day once', () => {
    const journal = recordCooked(recordCooked(EMPTY_JOURNAL, '2026-10-23'), '2026-10-23')

    expect(journal.cookedOn).toEqual(['2026-10-23'])
  })

  it('remembers whether the last Finish took the recipe off the shopping list', () => {
    const offList = recordFinished(EMPTY_JOURNAL, '2026-10-23', true)
    const again = recordFinished(offList, '2026-10-23', false)

    expect(offList).toEqual({ cookedOn: ['2026-10-23'], takenOffShoppingList: true })
    expect(again).toEqual({ cookedOn: ['2026-10-23'], takenOffShoppingList: false })
  })

  it('writes the date out in the reader’s language', () => {
    expect(formatCookedDate('2026-10-23', 'en')).toBe('23 October 2026')
    expect(formatCookedDate('2026-10-23', 'nl')).toBe('23 oktober 2026')
  })

  it('keeps the cooking days of journals saved with a note, and drops the note', () => {
    expect(parseSavedJournal({ cookedOn: ['2026-10-23'], note: 'Less salt' })).toEqual({ cookedOn: ['2026-10-23'] })
  })

  it('drops saved journals with dates in another format', () => {
    expect(parseSavedJournal({ cookedOn: ['23-10-2026'] })).toBeNull()
  })
})
