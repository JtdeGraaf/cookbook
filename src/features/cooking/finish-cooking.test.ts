// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { makeRecipe, makeStep } from '@/test/fixtures'
import { journalKey, parseSavedJournal } from '@/lib/journal'
import { EMPTY_SHOPPING_LIST } from '@/lib/shopping-list'
import { readSaved } from '@/lib/storage'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { timerStore } from '@/features/timers/timer-store'
import { finishCooking } from './finish-cooking'

const MINUTE = 60_000

const mousse = makeRecipe({
  slug: 'chocolate-mousse',
  folderPath: 'desserts',
  cook: [makeStep(), makeStep({ timer: { minutes: 120, label: { en: 'Chill', nl: 'Opstijven' } } })],
})

afterEach(() => {
  timerStore.getTimers().forEach((timer) => timerStore.remove(timer.id))
  shoppingListStore.set(() => EMPTY_SHOPPING_LIST)
  window.localStorage.clear()
})

describe('finishCooking', () => {
  it('keeps the chill timer running and leads it to the done page', () => {
    timerStore.start({
      id: 'desserts/chocolate-mousse/cook/2',
      label: { en: 'Chill', nl: 'Opstijven' },
      recipeTitle: mousse.title,
      path: '/desserts/chocolate-mousse/cook/2',
      durationMs: 120 * MINUTE,
    })

    finishCooking(mousse)

    expect(timerStore.getTimers().map((timer) => [timer.id, timer.path, timer.state.kind])).toEqual([
      ['desserts/chocolate-mousse/cook/2', '/desserts/chocolate-mousse/done', 'running'],
    ])
  })

  it('takes the recipe off the shopping list and saves that it did, for the done page after a reload', () => {
    shoppingListStore.set(() => ({ recipePaths: [mousse.path] }))

    finishCooking(mousse)

    expect(shoppingListStore.get().recipePaths).toEqual([])
    expect(readSaved(journalKey(mousse.path), parseSavedJournal)).toMatchObject({
      takenOffShoppingList: true,
    })
  })

  it('saves that the recipe was not on the shopping list', () => {
    finishCooking(mousse)

    expect(readSaved(journalKey(mousse.path), parseSavedJournal)).toMatchObject({
      takenOffShoppingList: false,
    })
  })
})
