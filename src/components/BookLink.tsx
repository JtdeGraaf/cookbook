import { Link } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'
import type { FilterSearch } from '@/lib/filters'

type BookLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /** A folder or recipe path inside the book, like "mains/pasta" or "mains/pasta/carbonara/prep". */
  path: string
  /** Filters to carry over to a folder page, so it opens as narrowed as the link that led there. */
  filterSearch?: FilterSearch
}

/**
 * A link to any folder or recipe page; they all share the one catch-all route. Only an exact match counts as the
 * current page, so the folders above it are not marked as current too.
 */
export function BookLink({ path, filterSearch = {}, ...anchor }: BookLinkProps) {
  return (
    <Link
      to="/$"
      params={{ _splat: path }}
      search={filterSearch}
      activeOptions={{ exact: true, includeSearch: false }}
      {...anchor}
    />
  )
}
