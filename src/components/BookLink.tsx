import { Link } from '@tanstack/react-router'
import type { ComponentPropsWithoutRef } from 'react'

type BookLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  /** A folder or recipe path inside the book, like "mains/pasta" or "mains/pasta/carbonara/prep". */
  path: string
}

/** A link to any folder or recipe page; they all share the one catch-all route. */
export function BookLink({ path, ...anchor }: BookLinkProps) {
  return <Link to="/$" params={{ _splat: path }} {...anchor} />
}
