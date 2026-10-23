import type { ChapterColor, LocalizedText, Unit } from './recipe-rules'

/** The cookbook after the build has read and checked every file under `recipes/`. */

/** Output of vite-imagetools with `as=img`: the largest webp plus a srcset of all widths. */
export type ResponsiveImage = { src: string; srcset: string; w: number; h: number }

export type Credit = { author: string; license: string; source: string }

export type Picture<File = ResponsiveImage> = { file: File; alt: LocalizedText; credit: Credit | null }

export type Quantity = { amount: number; unit: Unit }

export type Ingredient = {
  id: string
  name: LocalizedText
  /** Null means "to taste". */
  quantity: Quantity | null
  note: LocalizedText | null
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
  chapterSlug: string
  title: LocalizedText
  summary: LocalizedText
  servings: number
  prepMinutes: number
  cookMinutes: number
  tags: LocalizedText[]
  cover: Picture<File>
  ingredients: Ingredient[]
  prep: Step<File>[]
  cook: Step<File>[]
}

export type Chapter<File = ResponsiveImage> = {
  slug: string
  title: LocalizedText
  intro: LocalizedText | null
  color: ChapterColor
  recipes: Recipe<File>[]
}

export type Book<File = ResponsiveImage> = { chapters: Chapter<File>[] }

export function findChapter(book: Book, chapterSlug: string): Chapter | null {
  return book.chapters.find((chapter) => chapter.slug === chapterSlug) ?? null
}

export function findRecipe(book: Book, chapterSlug: string, recipeSlug: string): Recipe | null {
  return findChapter(book, chapterSlug)?.recipes.find((recipe) => recipe.slug === recipeSlug) ?? null
}

export function allRecipes(book: Book): Recipe[] {
  return book.chapters.flatMap((chapter) => chapter.recipes)
}

export function ingredientsForStep(recipe: Recipe, step: Step): Ingredient[] {
  return step.ingredientIds.flatMap((id) => recipe.ingredients.filter((ingredient) => ingredient.id === id))
}

/** Page numbers like a printed book: each chapter opens on one page, each recipe takes a two-page spread. */
export function numberPages(book: Book): Map<string, number> {
  const pages = new Map<string, number>()
  // Page 1 is the contents.
  let nextPage = 2
  for (const chapter of book.chapters) {
    pages.set(chapter.slug, nextPage)
    nextPage += 1
    for (const recipe of chapter.recipes) {
      pages.set(`${chapter.slug}/${recipe.slug}`, nextPage)
      nextPage += 2
    }
  }
  return pages
}
