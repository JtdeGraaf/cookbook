import { describe, expect, it } from 'vitest'
import { isSyncedKey, mergeSyncedValues } from './synced-data'

function conflict(key: string, base: unknown, mine: unknown, theirs: unknown, mineIsNewer = true) {
  return { key, base, mine, theirs, mineChangedAt: mineIsNewer ? 20 : 10, theirsChangedAt: 15 }
}

describe('what the book shares between phones', () => {
  it('shares favourites, the shopping list, progress and the journal', () => {
    expect(['favourites', 'shopping-list', 'progress:mains/soup', 'journal:mains/soup'].every(isSyncedKey)).toBe(true)
  })

  it('keeps timers, the theme, the language and the sync state on each phone', () => {
    expect(['timers', 'theme', 'language', 'sync', 'notifications-asked'].some(isSyncedKey)).toBe(false)
  })
})

describe('settling a value changed on two phones at once', () => {
  it('keeps favourites added on either phone and drops those taken off on either', () => {
    const merged = mergeSyncedValues(conflict('favourites', ['soup', 'stew'], ['soup', 'pie'], ['soup', 'stew', 'cake']))

    expect(merged).toEqual(['soup', 'cake', 'pie'])
  })

  it('keeps recipes put on the shopping list on either phone', () => {
    const merged = mergeSyncedValues(
      conflict('shopping-list', { recipePaths: [] }, { recipePaths: ['pie'] }, { recipePaths: ['soup'] }),
    )

    expect(merged).toEqual({ recipePaths: ['soup', 'pie'] })
  })

  it('keeps ingredients ticked on either phone and the newest number of servings', () => {
    const base = { servings: 4, haveIngredientIds: [], donePrepSteps: [], preppedAt: null }
    const mine = { servings: 6, haveIngredientIds: ['egg'], donePrepSteps: [0], preppedAt: 300 }
    const theirs = { servings: 2, haveIngredientIds: ['milk'], donePrepSteps: [], preppedAt: null }

    expect(mergeSyncedValues(conflict('progress:mains/soup', base, mine, theirs))).toEqual({
      servings: 6,
      haveIngredientIds: ['milk', 'egg'],
      donePrepSteps: [0],
      preppedAt: 300,
    })
    expect(mergeSyncedValues(conflict('progress:mains/soup', base, mine, theirs, false))).toMatchObject({ servings: 2 })
  })

  it('keeps the days cooked on either phone, newest first', () => {
    const merged = mergeSyncedValues(
      conflict('journal:mains/soup', null, { cookedOn: ['2026-10-01'] }, { cookedOn: ['2026-10-20'] }),
    )

    expect(merged).toEqual({ cookedOn: ['2026-10-20', '2026-10-01'] })
  })

  it('keeps the newest edit of a value that does not read as its kind', () => {
    expect(mergeSyncedValues(conflict('favourites', null, ['soup'], 'broken'))).toEqual(['soup'])
  })
})
