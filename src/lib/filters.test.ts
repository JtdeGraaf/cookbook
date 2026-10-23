import { describe, expect, it } from 'vitest'
import { both, makeBook, makeFolder, makeRecipe } from '@/test/fixtures'
import {
  NO_FILTERS,
  allTags,
  filterBook,
  filtersFromSearch,
  matchesFilters,
  parseFilterSearch,
  pickRandomRecipe,
  searchFromFilters,
} from './filters'

const quickPasta = makeRecipe({
  slug: 'quick-pasta',
  folderPath: 'mains/pasta',
  prepMinutes: 10,
  cookMinutes: 15,
  tags: [both('Vegetarian', 'vegetarisch'), both('quick', 'snel')],
})
const stew = makeRecipe({ slug: 'stew', prepMinutes: 30, cookMinutes: 120, tags: [both('winter')] })
const book = makeBook([
  makeFolder({ path: 'mains', recipes: [stew], folders: [makeFolder({ path: 'mains/pasta', recipes: [quickPasta] })] }),
])

describe('matchesFilters', () => {
  it('keeps everything without filters', () => {
    expect(matchesFilters(stew, NO_FILTERS, [])).toBe(true)
  })

  it('filters on total time', () => {
    const under30 = { ...NO_FILTERS, maxMinutes: 30 as const }

    expect(matchesFilters(quickPasta, under30, [])).toBe(true)
    expect(matchesFilters(stew, under30, [])).toBe(false)
  })

  it('filters on a tag, ignoring case', () => {
    expect(matchesFilters(quickPasta, { ...NO_FILTERS, tag: 'vegetarian' }, [])).toBe(true)
    expect(matchesFilters(stew, { ...NO_FILTERS, tag: 'vegetarian' }, [])).toBe(false)
  })

  it('filters on favourites', () => {
    const favouritesOnly = { ...NO_FILTERS, favouritesOnly: true }

    expect(matchesFilters(stew, favouritesOnly, ['mains/stew'])).toBe(true)
    expect(matchesFilters(quickPasta, favouritesOnly, ['mains/stew'])).toBe(false)
  })
})

describe('filterBook', () => {
  it('drops folders that end up empty', () => {
    const filtered = filterBook(book, (recipe) => recipe.slug === 'stew')

    expect(filtered.chapters[0].recipes.map((recipe) => recipe.slug)).toEqual(['stew'])
    expect(filtered.chapters[0].folders).toEqual([])
  })
})

describe('allTags', () => {
  it('lists each tag once', () => {
    expect(allTags(book).map((tag) => tag.en)).toEqual(['winter', 'Vegetarian', 'quick'])
  })
})

describe('pickRandomRecipe', () => {
  it('picks by the random number it is given', () => {
    expect(pickRandomRecipe([stew, quickPasta], () => 0.99)?.slug).toBe('quick-pasta')
    expect(pickRandomRecipe([stew, quickPasta], () => 0)?.slug).toBe('stew')
  })

  it('returns nothing from an empty list', () => {
    expect(pickRandomRecipe([], () => 0.5)).toBeNull()
  })
})

describe('filters in the address bar', () => {
  it('reads known values and drops the rest', () => {
    expect(parseFilterSearch({ time: '30', tag: 'quick', favourites: 'true', other: 'x' })).toEqual({
      time: 30,
      tag: 'quick',
      favourites: true,
    })
    expect(parseFilterSearch({ time: 45, tag: '' })).toEqual({})
  })

  it('round-trips filters', () => {
    const filters = { maxMinutes: 60 as const, tag: 'winter', favouritesOnly: false }

    expect(filtersFromSearch(searchFromFilters(filters))).toEqual(filters)
  })
})
