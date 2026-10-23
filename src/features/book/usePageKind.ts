import { useRouterState } from '@tanstack/react-router'
import { resolveBookPath } from '@/lib/book'
import { book } from './book-data'

/** The cover, a page inside a recipe (where the cook needs room), or any other page. */
export type PageKind = 'cover' | 'recipe' | 'other'

export function usePageKind(): PageKind {
  return useRouterState({
    select: (state) => {
      const pathname = state.location.pathname
      if (pathname === '/') return 'cover'
      return resolveBookPath(book, pathname)?.kind === 'recipe' ? 'recipe' : 'other'
    },
  })
}
