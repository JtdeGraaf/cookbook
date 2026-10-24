import { describe, expect, it } from 'vitest'
import { both, makeBook, makeFolder, makeRecipe } from '@/test/fixtures'
import { recipesInside } from './book'
import {
  NO_FILTERS,
  allTags,
  filterBook,
  filterFolder,
  folderAsFiltered,
  filtersFromSearch,
  matchesFilters,
  parseFilterSearch,
  pickRandomRecipe,
  searchFromFilters,
  tagsUsedIn,
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

  it('counts only the matching recipes in each folder, as the folder tree shows them', () => {
    const under30 = { ...NO_FILTERS, maxMinutes: 30 as const }
    const filtered = filterBook(book, (recipe) => matchesFilters(recipe, under30, []))

    expect(filtered.chapters.map((chapter) => [chapter.path, recipesInside(chapter).length])).toEqual([['mains', 1]])
    expect(filtered.chapters[0].recipes).toEqual([])
    expect(filtered.chapters[0].folders.map((folder) => folder.path)).toEqual(['mains/pasta'])
  })

  it('drops every chapter when nothing matches', () => {
    expect(filterBook(book, () => false).chapters).toEqual([])
  })
})

describe('filterFolder', () => {
  const mains = book.chapters[0]

  it('keeps only the matching recipes inside the folder and its sections', () => {
    const under30 = { ...NO_FILTERS, maxMinutes: 30 as const }
    const filtered = filterFolder(mains, (recipe) => matchesFilters(recipe, under30, []))

    expect(filtered.path).toBe('mains')
    expect(filtered.recipes).toEqual([])
    expect(recipesInside(filtered).map((recipe) => recipe.slug)).toEqual(['quick-pasta'])
  })

  it('drops sections that end up empty', () => {
    const filtered = filterFolder(mains, (recipe) => recipe.slug === 'stew')

    expect(filtered.recipes.map((recipe) => recipe.slug)).toEqual(['stew'])
    expect(filtered.folders).toEqual([])
  })

  it('keeps the folder itself when nothing matches', () => {
    const filtered = filterFolder(mains, () => false)

    expect(filtered.path).toBe('mains')
    expect(recipesInside(filtered)).toEqual([])
    expect(filtered.folders).toEqual([])
  })
})

describe('folderAsFiltered', () => {
  const emptySection = makeFolder({ path: 'mains/new' })
  const mains = makeFolder({ path: 'mains', recipes: [stew], folders: [emptySection] })

  it('leaves the folder as it is without filters, empty sections included', () => {
    expect(folderAsFiltered(mains, NO_FILTERS, [])).toBe(mains)
  })

  it('narrows the folder to the matching recipes when filtering', () => {
    const filtered = folderAsFiltered(mains, { ...NO_FILTERS, favouritesOnly: true }, ['mains/stew'])

    expect(filtered.recipes.map((recipe) => recipe.slug)).toEqual(['stew'])
    expect(filtered.folders).toEqual([])
  })
})

describe('tagsUsedIn', () => {
  it('lists only the tags of the given recipes, once each', () => {
    expect(tagsUsedIn([quickPasta, quickPasta]).map((tag) => tag.en)).toEqual(['Vegetarian', 'quick'])
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
