import { describe, expect, it } from 'vitest'
import { parseSavedFavourites, toggleFavourite } from './favourites'

describe('favourites', () => {
  it('adds and removes a recipe', () => {
    const favourites = toggleFavourite([], 'mains/stew')

    expect(favourites).toEqual(['mains/stew'])
    expect(toggleFavourite(favourites, 'mains/stew')).toEqual([])
  })

  it('drops saved favourites that are not a list of paths', () => {
    expect(parseSavedFavourites([1, 2])).toBeNull()
  })
})
