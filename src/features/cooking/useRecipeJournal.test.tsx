// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { makeRecipe } from '@/test/fixtures'
import { saveInOtherTab, saveInOtherTabQuietly } from '@/test/other-tab'
import { useRecipeJournal } from './useRecipeJournal'

const mousse = makeRecipe({ slug: 'chocolate-mousse', folderPath: 'desserts' })
const key = `journal:${mousse.path}`

afterEach(() => window.localStorage.clear())

describe('useRecipeJournal with the book open in two tabs', () => {
  it('shows a cook recorded by Finish in the other tab', () => {
    const { result } = renderHook(() => useRecipeJournal(mousse))

    act(() => saveInOtherTab(key, { cookedOn: ['2026-10-24'], note: '' }))

    expect(result.current.journal.cookedOn).toEqual(['2026-10-24'])
  })

  it('keeps the cook when a note is typed before the news of Finish arrives', () => {
    const { result } = renderHook(() => useRecipeJournal(mousse))
    saveInOtherTabQuietly(key, { cookedOn: ['2026-10-24', '2026-10-23'], note: '' })

    act(() => result.current.changeNote('Less sugar'))

    expect(JSON.parse(window.localStorage.getItem(`cookbook:${key}`) ?? 'null')).toEqual({
      cookedOn: ['2026-10-24', '2026-10-23'],
      note: 'Less sugar',
    })
  })
})
