import { Link } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'

type BookLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /** A folder or recipe path inside the book, like "mains/pasta" or "mains/pasta/carbonara/prep". */
  path: string
}

/**
 * A link to any folder or recipe page; they all share the one catch-all route. Only an exact match counts as the
 * current page, so the folders above it are not marked as current too.
 */
export function BookLink({ path, ...anchor }: BookLinkProps) {
  return <Link to="/$" params={{ _splat: path }} activeOptions={{ exact: true, includeSearch: false }} {...anchor} />
}
