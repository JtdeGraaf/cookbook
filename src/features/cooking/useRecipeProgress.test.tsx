// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeRecipe, makeStep } from '@/test/fixtures'
import { saveInOtherTab, saveInOtherTabQuietly } from '@/test/other-tab'
import { progressStore } from './progress-store'
import { useRecipeProgress } from './useRecipeProgress'

const soup = makeRecipe({ slug: 'soup', servings: 2, prep: [makeStep(), makeStep()] })
const stew = makeRecipe({ slug: 'stew', servings: 4 })

beforeEach(() => {
  window.localStorage.clear()
  progressStore.reload()
})

describe('useRecipeProgress', () => {
  it('unlocks cooking once every prep step is ticked', () => {
    const { result } = renderHook(() => useRecipeProgress(soup))

    act(() => result.current.togglePrepStep(0))
    expect(result.current.prepDone).toBe(false)

    act(() => result.current.togglePrepStep(1))
    expect(result.current.prepDone).toBe(true)
  })

  it('remembers ticks and servings after a reload', () => {
    const first = renderHook(() => useRecipeProgress(soup))
    act(() => {
      first.result.current.toggleIngredient('salt')
      first.result.current.setServings(5)
    })
    first.unmount()
    progressStore.reload()

    const { result } = renderHook(() => useRecipeProgress(soup))

    expect(result.current.servings).toBe(5)
    expect(result.current.progress.haveIngredientIds).toEqual(['salt'])
  })

  it('loads the other recipe when the page switches recipes', () => {
    const { result, rerender } = renderHook(({ recipe }) => useRecipeProgress(recipe), {
      initialProps: { recipe: soup },
    })
    act(() => result.current.setServings(6))

    rerender({ recipe: stew })

    expect(result.current.servings).toBe(4)
  })

  it('starts fresh when the saved progress is broken', () => {
    window.localStorage.setItem('cookbook:progress:mains/soup', '{"servings": "lots"}')
    progressStore.reload()

    const { result } = renderHook(() => useRecipeProgress(soup))

    expect(result.current.servings).toBe(2)
    expect(result.current.progress.donePrepSteps).toEqual([])
  })

  it('shows a tick made in another tab', () => {
    const { result } = renderHook(() => useRecipeProgress(soup))
    act(() => result.current.toggleIngredient('salt'))
    const saved = JSON.parse(window.localStorage.getItem(`cookbook:progress:${soup.path}`) ?? 'null')

    act(() => saveInOtherTab(`progress:${soup.path}`, { ...saved, haveIngredientIds: ['salt', 'pepper'] }))

    expect(result.current.progress.haveIngredientIds).toEqual(['salt', 'pepper'])
  })

  it('keeps a tick made in another tab whose news has not arrived yet', () => {
    const { result } = renderHook(() => useRecipeProgress(soup))
    act(() => result.current.toggleIngredient('salt'))
    const saved = JSON.parse(window.localStorage.getItem(`cookbook:progress:${soup.path}`) ?? 'null')
    saveInOtherTabQuietly(`progress:${soup.path}`, { ...saved, haveIngredientIds: ['salt', 'pepper'] })

    act(() => result.current.toggleIngredient('garlic'))

    expect(result.current.progress.haveIngredientIds).toEqual(['salt', 'pepper', 'garlic'])
  })
})
