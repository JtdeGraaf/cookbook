import { describe, expect, it } from 'vitest'
import { makeRecipe, makeStep } from '@/test/fixtures'
import {
  EMPTY_PROGRESS,
  changeServings,
  clearTicks,
  isPrepDone,
  parseSavedProgress,
  servingsFor,
  toggleIngredient,
  togglePrepStep,
} from './progress'

const recipe = makeRecipe({ slug: 'soup', servings: 4, prep: [makeStep(), makeStep()] })

describe('recipe progress', () => {
  it('uses the recipe servings until the cook picks a number', () => {
    expect(servingsFor(recipe, EMPTY_PROGRESS)).toBe(4)
    expect(servingsFor(recipe, changeServings(EMPTY_PROGRESS, 6))).toBe(6)
  })

  it('keeps servings between 1 and 24', () => {
    expect(changeServings(EMPTY_PROGRESS, 0).servings).toBe(1)
    expect(changeServings(EMPTY_PROGRESS, 99).servings).toBe(24)
  })

  it('ticks and unticks an ingredient', () => {
    const ticked = toggleIngredient(EMPTY_PROGRESS, 'salt')

    expect(ticked.checkedIngredientIds).toEqual(['salt'])
    expect(toggleIngredient(ticked, 'salt').checkedIngredientIds).toEqual([])
  })

  it('allows cooking only when every prep step is done', () => {
    const halfway = togglePrepStep(EMPTY_PROGRESS, 0)

    expect(isPrepDone(recipe, halfway)).toBe(false)
    expect(isPrepDone(recipe, togglePrepStep(halfway, 1))).toBe(true)
  })

  it('clears ticks but keeps the servings', () => {
    const progress = togglePrepStep(toggleIngredient(changeServings(EMPTY_PROGRESS, 3), 'salt'), 0)

    expect(clearTicks(progress)).toEqual({ servings: 3, checkedIngredientIds: [], donePrepSteps: [] })
  })

  it('rejects saved progress with an impossible number of servings', () => {
    expect(parseSavedProgress({ servings: 0, checkedIngredientIds: [], donePrepSteps: [] })).toBeNull()
    expect(parseSavedProgress({ servings: null, checkedIngredientIds: ['salt'], donePrepSteps: [1] })).toEqual({
      servings: null,
      checkedIngredientIds: ['salt'],
      donePrepSteps: [1],
    })
  })
})
