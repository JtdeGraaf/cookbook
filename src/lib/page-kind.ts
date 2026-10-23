/** Which kind of page a path is: the book's cover, a recipe being read or cooked, or anything else. */
export type PageKind = 'cover' | 'recipe' | 'other'

export function pageKindFor(pathname: string): PageKind {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return 'cover'
  if (parts.length >= 2 && parts[0] !== 'search') return 'recipe'
  return 'other'
}
