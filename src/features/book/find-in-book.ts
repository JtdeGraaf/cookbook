import { notFound } from '@tanstack/react-router'
import { resolveBookPath, type BookPage } from '@/lib/book'
import { book } from './book-data'

/** For the catch-all route: the folder or recipe page an address points at, or the not-found page. */
export function pageOrNotFound(address: string): BookPage {
  const page = resolveBookPath(book, address)
  if (!page) throw notFound()
  return page
}
