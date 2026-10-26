import { allRecipes, parentPaths, type Book, type Folder, type Recipe } from './book'
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

/** A time limit asks for a meal that fits the evening, so a drink never matches one. */
export function matchesFilters(recipe: Recipe, filters: RecipeFilters, favourites: string[]): boolean {
  if (filters.maxMinutes !== null && !fitsTimeLimit(recipe, filters.maxMinutes)) return false
  if (filters.tag !== null && !recipe.tags.some((tag) => tagKey(tag) === filters.tag)) return false
  if (filters.favouritesOnly && !favourites.includes(recipe.path)) return false
  return true
}

function fitsTimeLimit(recipe: Recipe, maxMinutes: number): boolean {
  return recipe.kind === 'dish' && recipe.prepMinutes + recipe.cookMinutes <= maxMinutes
}

/** Time limits are only offered where there is a dish to time, so a page of drinks doesn't show them. */
export function offersTimeLimits(recipes: Recipe[]): boolean {
  return recipes.some((recipe) => recipe.kind === 'dish')
}

/**
 * The book with only the recipes that match; folders left empty disappear, except the folder at `keptPath` and the
 * folders above it, so the folder tree never loses the page you are on.
 */
export function filterBook(book: Book, keep: (recipe: Recipe) => boolean, keptPath = ''): Book {
  const keptFolders = parentPaths(keptPath)
  return { chapters: book.chapters.flatMap((chapter) => matchingFolders(chapter, keep, keptFolders)) }
}

/** What the folder tree shows: the whole book without filters; otherwise only what matches, plus the folder you are in. */
export function bookAsFiltered(book: Book, filters: RecipeFilters, favourites: string[], currentPath: string): Book {
  if (!hasFilters(filters)) return book
  return filterBook(book, (recipe) => matchesFilters(recipe, filters, favourites), currentPath)
}

/**
 * A folder with only the recipes that match, as deep as it goes; sections left empty disappear. The folder itself
 * always stays, so its page can still say that nothing matches.
 */
export function filterFolder(folder: Folder, keep: (recipe: Recipe) => boolean): Folder {
  return narrowFolder(folder, keep, [])
}

/** What a folder page lists: everything without filters, empty sections too; otherwise only what matches. */
export function folderAsFiltered(folder: Folder, filters: RecipeFilters, favourites: string[]): Folder {
  if (!hasFilters(filters)) return folder
  return filterFolder(folder, (recipe) => matchesFilters(recipe, filters, favourites))
}

/** `keptFolders` are the paths of folders that stay even when nothing in them matches. */
function narrowFolder(folder: Folder, keep: (recipe: Recipe) => boolean, keptFolders: string[]): Folder {
  const recipes = folder.recipes.filter(keep)
  const folders = folder.folders.flatMap((child) => matchingFolders(child, keep, keptFolders))
  return { ...folder, recipes, folders }
}

function matchingFolders(folder: Folder, keep: (recipe: Recipe) => boolean, keptFolders: string[]): Folder[] {
  const filtered = narrowFolder(folder, keep, keptFolders)
  if (keptFolders.includes(folder.path)) return [filtered]
  if (filtered.recipes.length === 0 && filtered.folders.length === 0) return []
  return [filtered]
}

/** Every tag used in the book, once each, in the order they first appear. */
export function allTags(book: Book): LocalizedText[] {
  return tagsUsedIn(allRecipes(book))
}

/** Every tag used by these recipes, once each, in the order they first appear. */
export function tagsUsedIn(recipes: Recipe[]): LocalizedText[] {
  const seen = new Map<string, LocalizedText>()
  for (const tag of recipes.flatMap((recipe) => recipe.tags)) {
    if (!seen.has(tagKey(tag))) seen.set(tagKey(tag), tag)
  }
  return [...seen.values()]
}

/** `random` returns a number from 0 up to 1, like Math.random; tests pass a fixed one. */
export function pickRandomRecipe(recipes: Recipe[], random: () => number): Recipe | null {
  if (recipes.length === 0) return null
  return recipes[Math.min(recipes.length - 1, Math.floor(random() * recipes.length))]
}

/** Filters as they appear in the address bar, so a filtered contents or folder page can be bookmarked. */
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
