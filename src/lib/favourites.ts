import { z } from 'zod/mini'

/** Favourite recipes, stored as their paths. */
export type Favourites = string[]

export function toggleFavourite(favourites: Favourites, recipePath: string): Favourites {
  return favourites.includes(recipePath)
    ? favourites.filter((path) => path !== recipePath)
    : [...favourites, recipePath]
}

export function parseSavedFavourites(value: unknown): Favourites | null {
  const result = z.array(z.string()).safeParse(value)
  return result.success ? result.data : null
}
