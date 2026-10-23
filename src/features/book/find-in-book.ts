import { notFound } from '@tanstack/react-router'
import { findChapter, findRecipe, type Chapter, type Recipe } from '@/lib/book'
import { book } from './book-data'

/** For route loaders: the chapter in the URL, or the not-found page. */
export function chapterOrNotFound(chapterSlug: string): Chapter {
  const chapter = findChapter(book, chapterSlug)
  if (!chapter) throw notFound()
  return chapter
}

/** For route loaders: the recipe and its chapter in the URL, or the not-found page. */
export function recipeOrNotFound(chapterSlug: string, recipeSlug: string): { chapter: Chapter; recipe: Recipe } {
  const chapter = chapterOrNotFound(chapterSlug)
  const recipe = findRecipe(book, chapterSlug, recipeSlug)
  if (!recipe) throw notFound()
  return { chapter, recipe }
}

/** For the cooking step route: a whole step number that exists in this recipe. */
export function stepNumberOrNotFound(recipe: Recipe, step: string): number {
  const stepNumber = Number(step)
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > recipe.cook.length) throw notFound()
  return stepNumber
}
