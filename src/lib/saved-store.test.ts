// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { saveInOtherTab, saveInOtherTabQuietly } from '@/test/other-tab'
import { parseSavedFavourites, toggleFavourite, type Favourites } from './favourites'
import { createSavedStore } from './saved-store'

afterEach(() => window.localStorage.clear())

function favouritesStore(key: string) {
  return createSavedStore<Favourites>(key, parseSavedFavourites, [])
}

describe('createSavedStore', () => {
  it('shows a change made in another tab and tells its readers', () => {
    const store = favouritesStore('favourites-a')
    store.set((favourites) => toggleFavourite(favourites, 'mains/pasta/carbonara'))
    let told = 0
    store.subscribe(() => (told += 1))

    saveInOtherTab('favourites-a', ['mains/pasta/carbonara', 'mains/pasta/aglio-e-olio'])

    expect(store.get()).toEqual(['mains/pasta/carbonara', 'mains/pasta/aglio-e-olio'])
    expect(told).toBe(1)
  })

  it('ignores changes to other keys', () => {
    const store = favouritesStore('favourites-b')
    let told = 0
    store.subscribe(() => (told += 1))

    saveInOtherTab('shopping-list', { recipes: [] })

    expect(store.get()).toEqual([])
    expect(told).toBe(0)
  })

  it('keeps a change made in another tab whose news has not arrived yet', () => {
    const store = favouritesStore('favourites-c')
    store.set((favourites) => toggleFavourite(favourites, 'mains/pasta/carbonara'))

    saveInOtherTabQuietly('favourites-c', ['mains/pasta/carbonara', 'mains/pasta/aglio-e-olio'])
    store.set((favourites) => toggleFavourite(favourites, 'desserts/chocolate-mousse'))

    expect(store.get()).toEqual(['mains/pasta/carbonara', 'mains/pasta/aglio-e-olio', 'desserts/chocolate-mousse'])
    expect(JSON.parse(window.localStorage.getItem('cookbook:favourites-c') ?? 'null')).toEqual(store.get())
  })

  it('leaves storage and readers alone when nothing changes', () => {
    const store = favouritesStore('favourites-d')
    let told = 0
    store.subscribe(() => (told += 1))

    store.set((favourites) => favourites)

    expect(told).toBe(0)
    expect(window.localStorage.getItem('cookbook:favourites-d')).toBeNull()
  })
})
