import { book } from 'virtual:recipe-book'
import { numberPages, type Chapter, type Recipe } from '@/lib/book'
import { buildSearchIndex } from '@/lib/search'

export { book }

const pages = numberPages(book)

export const searchIndex = buildSearchIndex(book)

export function chapterPage(chapter: Chapter): number | null {
  return pages.get(chapter.slug) ?? null
}

export function recipePage(recipe: Recipe): number | null {
  return pages.get(`${recipe.chapterSlug}/${recipe.slug}`) ?? null
}
