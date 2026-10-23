import { allRecipes, type Book, type Folder, type Recipe } from './book'
import type { LocalizedText } from './recipe-rules'

/** The time limits offered as filters, in minutes of prep plus cooking. */
export const TIME_LIMITS = [30, 60] as const

export type TimeLimit = (typeof TIME_LIMITS)[number]

export type RecipeFilters = {
  maxMinutes: TimeLimit | null
  /** A tag's English text, lowercase. Null means any tag. */
  tag: string | null
  favouritesOnly: boolean
}

export const NO_FILTERS: RecipeFilters = { maxMinutes: null, tag: null, favouritesOnly: false }

export function hasFilters(filters: RecipeFilters): boolean {
  return filters.maxMinutes !== null || filters.tag !== null || filters.favouritesOnly
}

export function tagKey(tag: LocalizedText): string {
  return tag.en.toLowerCase()
}

export function matchesFilters(recipe: Recipe, filters: RecipeFilters, favourites: string[]): boolean {
  if (filters.maxMinutes !== null && recipe.prepMinutes + recipe.cookMinutes > filters.maxMinutes) return false
  if (filters.tag !== null && !recipe.tags.some((tag) => tagKey(tag) === filters.tag)) return false
  if (filters.favouritesOnly && !favourites.includes(recipe.path)) return false
  return true
}

/** The book with only the recipes that match; folders left empty disappear. */
export function filterBook(book: Book, keep: (recipe: Recipe) => boolean): Book {
  return { chapters: book.chapters.flatMap((chapter) => filterFolder(chapter, keep)) }
}

function filterFolder(folder: Folder, keep: (recipe: Recipe) => boolean): Folder[] {
  const recipes = folder.recipes.filter(keep)
  const folders = folder.folders.flatMap((child) => filterFolder(child, keep))
  if (recipes.length === 0 && folders.length === 0) return []
  return [{ ...folder, recipes, folders }]
}

/** Every tag used in the book, once each, in the order they first appear. */
export function allTags(book: Book): LocalizedText[] {
  const seen = new Map<string, LocalizedText>()
  for (const tag of allRecipes(book).flatMap((recipe) => recipe.tags)) {
    if (!seen.has(tagKey(tag))) seen.set(tagKey(tag), tag)
  }
  return [...seen.values()]
}

/** `random` returns a number from 0 up to 1, like Math.random; tests pass a fixed one. */
export function pickRandomRecipe(recipes: Recipe[], random: () => number): Recipe | null {
  if (recipes.length === 0) return null
  return recipes[Math.min(recipes.length - 1, Math.floor(random() * recipes.length))]
}

/** Filters as they appear in the address bar, so a filtered contents page can be bookmarked. */
export type FilterSearch = { time?: TimeLimit; tag?: string; favourites?: true }

/** Anything in the address bar that isn't a known filter value is dropped. */
export function parseFilterSearch(search: Record<string, unknown>): FilterSearch {
  const time = TIME_LIMITS.find((limit) => limit === Number(search.time))
  const tag = typeof search.tag === 'string' && search.tag !== '' ? search.tag : undefined
  const favourites = search.favourites === true || search.favourites === 'true' ? true : undefined
  return { ...(time ? { time } : {}), ...(tag ? { tag } : {}), ...(favourites ? { favourites } : {}) }
}

export function filtersFromSearch(search: FilterSearch): RecipeFilters {
  return { maxMinutes: search.time ?? null, tag: search.tag ?? null, favouritesOnly: search.favourites === true }
}

export function searchFromFilters(filters: RecipeFilters): FilterSearch {
  return parseFilterSearch({ time: filters.maxMinutes, tag: filters.tag, favourites: filters.favouritesOnly })
}
