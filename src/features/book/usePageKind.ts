import { useRouterState } from '@tanstack/react-router'
import { resolveBookPath } from '@/lib/book'
import { book } from './book-data'

/**
 * What kind of page is open: the contents, the prep or cooking steps of a recipe (where the cook needs the room and
 * the screen kept on), another recipe page, or anything else.
 */
export type PageKind = 'contents' | 'cooking' | 'recipe' | 'other'

export function usePageKind(): PageKind {
  return useRouterState({
    select: (state) => {
      const pathname = state.location.pathname
      if (pathname === '/') return 'contents'
      const page = resolveBookPath(book, pathname)
      if (page?.kind !== 'recipe') return 'other'
      return page.view.name === 'prep' || page.view.name === 'cook' ? 'cooking' : 'recipe'
    },
  })
}
