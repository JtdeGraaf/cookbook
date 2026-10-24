import type { ChapterColor, LocalizedText, Unit } from './recipe-rules.ts'

/** The cookbook after the build has read and checked every file under `recipes/`. */

/** Output of vite-imagetools with `as=img`: the largest webp plus a srcset of all widths. */
export type ResponsiveImage = { src: string; srcset: string; w: number; h: number }

export type Credit = { author: string; license: string; source: string }

export type Picture<File = ResponsiveImage> = { file: File; alt: LocalizedText; credit: Credit | null }

/** The recipe this one is based on. A null name means the link shows the website name. */
export type RecipeSource = { url: string; name: string | null }

export type Quantity = { amount: number; unit: Unit }

export type Ingredient = {
  id: string
  name: LocalizedText
  /** The name for more than one, like "eggs"; null when the name never changes. */
  plural: LocalizedText | null
  /** Null means "to taste". */
  quantity: Quantity | null
  note: LocalizedText | null
  /** A staple the kitchen always has, like salt or water; the shopping list leaves it off. */
  pantry: boolean
}

export type StepTimer = { minutes: number; label: LocalizedText }

export type Step<File = ResponsiveImage> = {
  text: LocalizedText
  ingredientIds: string[]
  timer: StepTimer | null
  tip: LocalizedText | null
  image: Picture<File> | null
}

export type Recipe<File = ResponsiveImage> = {
  slug: string
  /** Folder names from `recipes/` down to this recipe, like "mains/pasta/carbonara". Also its web address. */
  path: string
  /** Path of the folder the recipe sits in, like "mains/pasta". */
  folderPath: string
  /** Colour of the chapter the recipe is in. */
  color: ChapterColor
  title: LocalizedText
  summary: LocalizedText
  servings: number
  prepMinutes: number
  cookMinutes: number
  tags: LocalizedText[]
  /** Null until someone adds a photo. */
  cover: Picture<File> | null
  /** Null for our own recipes. */
  source: RecipeSource | null
  ingredients: Ingredient[]
  prep: Step<File>[]
  cook: Step<File>[]
}

/** A folder under `recipes/`. Top-level folders are the chapters; folders inside them are sections. */
export type Folder<File = ResponsiveImage> = {
  slug: string
  path: string
  title: LocalizedText
  intro: LocalizedText | null
  color: ChapterColor
  folders: Folder<File>[]
  recipes: Recipe<File>[]
}

export type Book<File = ResponsiveImage> = { chapters: Folder<File>[] }

export type RecipeView = { name: 'overview' } | { name: 'prep' } | { name: 'cook'; stepNumber: number } | { name: 'done' }

/** What a web address inside the book points at. */
export type BookPage = { kind: 'folder'; folder: Folder } | { kind: 'recipe'; recipe: Recipe; view: RecipeView }

export function findFolder(book: Book, path: string): Folder | null {
  return allFolders(book).find((folder) => folder.path === path) ?? null
}

export function findRecipe(book: Book, path: string): Recipe | null {
  return allRecipes(book).find((recipe) => recipe.path === path) ?? null
}

export function allFolders(book: Book): Folder[] {
  return book.chapters.flatMap(foldersInside)
}

function foldersInside(folder: Folder): Folder[] {
  return [folder, ...folder.folders.flatMap(foldersInside)]
}

export function allRecipes<File = ResponsiveImage>(book: Book<File>): Recipe<File>[] {
  return book.chapters.flatMap(recipesInside)
}

/** Every recipe in a folder and all folders below it, in book order. */
export function recipesInside<File = ResponsiveImage>(folder: Folder<File>): Recipe<File>[] {
  return [...folder.recipes, ...folder.folders.flatMap(recipesInside)]
}

/** The folders from the chapter down to `path`, for a path bar. */
export function folderTrail(book: Book, path: string): Folder[] {
  return parentPaths(path).flatMap((ancestor) => {
    const folder = findFolder(book, ancestor)
    return folder ? [folder] : []
  })
}

/** "mains/pasta/carbonara" becomes ["mains", "mains/pasta", "mains/pasta/carbonara"]. */
export function parentPaths(path: string): string[] {
  const parts = path.split('/').filter(Boolean)
  return parts.map((_part, index) => parts.slice(0, index + 1).join('/'))
}

/**
 * The deepest folder or recipe that does exist on the way to an address that doesn't, for a helpful not-found page.
 * A recipe beats its folder, so a step that no longer exists leads back to the recipe.
 */
export function nearestFolderOrRecipe(book: Book, address: string): Folder | Recipe | null {
  const candidates = parentPaths(address).reverse()
  for (const path of candidates) {
    const found = findRecipe(book, path) ?? findFolder(book, path)
    if (found) return found
  }
  return null
}

/** Words in an address that name a recipe's own pages rather than anything worth searching for. */
const RECIPE_PAGE_WORDS = new Set(['prep', 'cook', 'done'])

/**
 * What to search for when an address isn't in the book: the last part that isn't a folder, with dashes as spaces.
 * "mains/pasta/pasta-pesto/prep" becomes "pasta pesto". Empty when there is nothing sensible to search for.
 */
export function searchTermForMissingPage(book: Book, address: string): string {
  const paths = parentPaths(address).reverse()
  for (const path of paths) {
    if (findFolder(book, path)) return ''
    const part = decodeAddressPart(path.split('/').at(-1) ?? '')
    if (RECIPE_PAGE_WORDS.has(part.toLowerCase()) || /^\d+$/.test(part)) continue
    const words = part.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
    if (words) return words
  }
  return ''
}

/** "%C3%A9" becomes "é"; a broken escape is kept as typed. */
function decodeAddressPart(part: string): string {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

export function ingredientsForStep(recipe: Recipe, step: Step): Ingredient[] {
  return step.ingredientIds.flatMap((id) => recipe.ingredients.filter((ingredient) => ingredient.id === id))
}

/** Page numbers like a printed book: each folder opens on one page, each recipe takes a two-page spread. */
export function numberPages(book: Book): Map<string, number> {
  const pages = new Map<string, number>()
  // Page 1 is the contents.
  let nextPage = 2
  const numberFolder = (folder: Folder) => {
    pages.set(folder.path, nextPage)
    nextPage += 1
    for (const recipe of folder.recipes) {
      pages.set(recipe.path, nextPage)
      nextPage += 2
    }
    folder.folders.forEach(numberFolder)
  }
  book.chapters.forEach(numberFolder)
  return pages
}

/** The part of the address after the recipe: nothing, "prep", "cook/<step>" or "done". */
export function recipeViewPath(recipe: Recipe, view: RecipeView): string {
  switch (view.name) {
    case 'overview':
      return recipe.path
    case 'prep':
      return `${recipe.path}/prep`
    case 'cook':
      return `${recipe.path}/cook/${view.stepNumber}`
    case 'done':
      return `${recipe.path}/done`
  }
}

/** Works out whether an address is a folder, a recipe or one of a recipe's pages. Null when nothing matches. */
export function resolveBookPath(book: Book, address: string): BookPage | null {
  const parts = address.split('/').filter(Boolean)
  const path = parts.join('/')
  const folder = findFolder(book, path)
  if (folder) return { kind: 'folder', folder }

  const recipe = findRecipe(book, path)
  if (recipe) return { kind: 'recipe', recipe, view: { name: 'overview' } }

  const last = parts.at(-1)
  if (last === 'prep' || last === 'done') {
    const owner = findRecipe(book, parts.slice(0, -1).join('/'))
    return owner ? { kind: 'recipe', recipe: owner, view: { name: last } } : null
  }

  if (parts.at(-2) !== 'cook') return null
  const owner = findRecipe(book, parts.slice(0, -2).join('/'))
  const stepNumber = Number(last)
  if (!owner || !Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > owner.cook.length) return null
  return { kind: 'recipe', recipe: owner, view: { name: 'cook', stepNumber } }
}
