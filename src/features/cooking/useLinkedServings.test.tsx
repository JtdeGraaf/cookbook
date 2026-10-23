// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeRecipe } from '@/test/fixtures'
import { useLinkedServings } from './useLinkedServings'
import { useRecipeProgress } from './useRecipeProgress'

const soup = makeRecipe({ slug: 'soup', servings: 2 })

function useRecipeWithLink(linkedServings: number | null, onUsed: () => void) {
  const controls = useRecipeProgress(soup)
  useLinkedServings(controls, linkedServings, onUsed)
  return controls
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('useLinkedServings', () => {
  it('applies servings from a shared link once, then lets the address drop it', () => {
    const onUsed = vi.fn()

    const { result, rerender } = renderHook(({ linked }) => useRecipeWithLink(linked, onUsed), {
      initialProps: { linked: 6 as number | null },
    })
    rerender({ linked: 6 })

    expect(result.current.servings).toBe(6)
    expect(onUsed).toHaveBeenCalledTimes(1)
  })

  it('leaves the cook’s own change alone once the link is used', () => {
    const { result, rerender } = renderHook(({ linked }) => useRecipeWithLink(linked, () => {}), {
      initialProps: { linked: 6 as number | null },
    })
    rerender({ linked: null })

    act(() => result.current.setServings(3))
    rerender({ linked: null })

    expect(result.current.servings).toBe(3)
  })
})
