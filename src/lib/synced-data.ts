import { mergeLists, newestWins, type Conflict, type Merge } from '@graaf/unsafe-device-sync/client'
import { parseSavedFavourites } from './favourites'
import { journalKey, parseSavedJournal } from './journal'
import { parseSavedProgress, progressKey } from './progress'
import { parseSavedShoppingList } from './shopping-list'

/**
 * What the book shares between phones: favourites, the shopping list, and each recipe's progress and journal.
 * Timers, the theme and the language stay on each phone.
 */
export function isSyncedKey(key: string): boolean {
  return (
    key === 'favourites' || key === 'shopping-list' || key.startsWith(journalKey('')) || key.startsWith(progressKey(''))
  )
}

/**
 * Settles a value changed on this phone and another at once. Lists keep what either phone added and drop what
 * either removed; single values keep the newest edit. A value that does not read as its kind falls back to the
 * newest edit.
 */
export const mergeSyncedValues: Merge = (conflict) => {
  if (conflict.key === 'favourites') return mergeParsed(conflict, parseSavedFavourites, mergeLists)
  if (conflict.key === 'shopping-list') {
    return mergeParsed(conflict, parseSavedShoppingList, (base, mine, theirs) => ({
      recipePaths: mergeLists(base?.recipePaths ?? null, mine.recipePaths, theirs.recipePaths),
    }))
  }
  if (conflict.key.startsWith(journalKey(''))) {
    return mergeParsed(conflict, parseSavedJournal, (base, mine, theirs) => ({
      ...(mineIsNewer(conflict) ? mine : theirs),
      cookedOn: mergeLists(base?.cookedOn ?? null, mine.cookedOn, theirs.cookedOn).sort().reverse(),
    }))
  }
  if (conflict.key.startsWith(progressKey(''))) {
    return mergeParsed(conflict, parseSavedProgress, (base, mine, theirs) => ({
      servings: mineIsNewer(conflict) ? mine.servings : theirs.servings,
      haveIngredientIds: mergeLists(base?.haveIngredientIds ?? null, mine.haveIngredientIds, theirs.haveIngredientIds),
      donePrepSteps: mergeLists(base?.donePrepSteps ?? null, mine.donePrepSteps, theirs.donePrepSteps),
      preppedAt: Math.max(mine.preppedAt ?? 0, theirs.preppedAt ?? 0) || null,
    }))
  }
  return newestWins(conflict)
}

function mergeParsed<T>(
  conflict: Conflict,
  parse: (value: unknown) => T | null,
  merge: (base: T | null, mine: T, theirs: T) => T,
): unknown {
  const mine = parse(conflict.mine)
  const theirs = parse(conflict.theirs)
  if (mine === null || theirs === null) return newestWins(conflict)
  return merge(parse(conflict.base), mine, theirs)
}

function mineIsNewer(conflict: Conflict): boolean {
  return conflict.mineChangedAt >= conflict.theirsChangedAt
}
