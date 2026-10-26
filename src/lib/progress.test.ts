import { describe, expect, it } from 'vitest'
import { makeDrink, makeRecipe, makeStep } from '@/test/fixtures'
import {
  EMPTY_PROGRESS,
  SESSION_LENGTH_MS,
  changeServings,
  clearTicks,
  firstOpenPrepStep,
  forgetOldPrep,
  isPrepDone,
  parseSavedProgress,
  servingsFor,
  setHaveIngredients,
  toggleIngredient,
  togglePrepStep,
} from './progress'

const recipe = makeRecipe({ slug: 'soup', servings: 4, prep: [makeStep(), makeStep()] })
const NOW = 1_000_000_000

describe('recipe progress', () => {
  it('points at the first prep step still to do, skipping ticked ones', () => {
    const three = makeRecipe({ slug: 'stew', prep: [makeStep(), makeStep(), makeStep()] })

    expect(firstOpenPrepStep(three, EMPTY_PROGRESS)).toBe(0)
    expect(firstOpenPrepStep(three, { ...EMPTY_PROGRESS, donePrepSteps: [0, 2] })).toBe(1)
    expect(firstOpenPrepStep(three, { ...EMPTY_PROGRESS, donePrepSteps: [2, 0, 1] })).toBeNull()
  })

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

    expect(ticked.haveIngredientIds).toEqual(['salt'])
    expect(toggleIngredient(ticked, 'salt').haveIngredientIds).toEqual([])
  })

  it('marks several ingredients at once without doubling any', () => {
    const progress = setHaveIngredients(toggleIngredient(EMPTY_PROGRESS, 'egg'), ['egg', 'yolk'], true)

    expect(progress.haveIngredientIds).toEqual(['egg', 'yolk'])
    expect(setHaveIngredients(progress, ['egg'], false).haveIngredientIds).toEqual(['yolk'])
  })

  it('allows cooking only when every prep step is done', () => {
    const halfway = togglePrepStep(EMPTY_PROGRESS, 0, NOW)

    expect(isPrepDone(recipe, halfway)).toBe(false)
    expect(isPrepDone(recipe, togglePrepStep(halfway, 1, NOW))).toBe(true)
  })

  it('never holds a drink back, since it has no prep list', () => {
    expect(isPrepDone(makeDrink({ slug: 'negroni' }), EMPTY_PROGRESS)).toBe(true)
  })

  it('clears ticks but keeps the servings', () => {
    const progress = togglePrepStep(toggleIngredient(changeServings(EMPTY_PROGRESS, 3), 'salt'), 0, NOW)

    expect(clearTicks(progress)).toEqual({ servings: 3, haveIngredientIds: [], donePrepSteps: [], preppedAt: null })
  })

  it('forgets prep from an earlier session, but keeps what you have in the house', () => {
    const progress = togglePrepStep(toggleIngredient(changeServings(EMPTY_PROGRESS, 3), 'salt'), 0, NOW)

    expect(forgetOldPrep(progress, NOW + SESSION_LENGTH_MS)).toBe(progress)
    expect(forgetOldPrep(progress, NOW + SESSION_LENGTH_MS + 1)).toEqual({
      servings: 3,
      haveIngredientIds: ['salt'],
      donePrepSteps: [],
      preppedAt: null,
    })
  })

  it('reads progress saved by the first version, keeping servings and ticked ingredients', () => {
    expect(parseSavedProgress({ servings: 4, checkedIngredientIds: ['salt'], donePrepSteps: [0] })).toEqual({
      servings: 4,
      haveIngredientIds: ['salt'],
      donePrepSteps: [],
      preppedAt: null,
    })
  })

  it('rejects saved progress with an impossible number of servings', () => {
    const saved = { servings: 0, haveIngredientIds: [], donePrepSteps: [], preppedAt: null }

    expect(parseSavedProgress(saved)).toBeNull()
    expect(parseSavedProgress({ ...saved, servings: null })).toEqual({ ...saved, servings: null })
  })
})
