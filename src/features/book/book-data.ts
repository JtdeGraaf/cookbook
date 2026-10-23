import { book } from 'virtual:recipe-book'
import { numberPages } from '@/lib/book'
import { buildSearchIndex } from '@/lib/search'

export { book }

const pages = numberPages(book)

export const searchIndex = buildSearchIndex(book)

/** The printed-book page number of a folder or recipe. */
export function pageOf(path: string): number | null {
  return pages.get(path) ?? null
}
