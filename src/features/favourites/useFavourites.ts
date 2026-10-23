import { useSyncExternalStore } from 'react'
import { parseSavedFavourites, toggleFavourite, type Favourites } from '@/lib/favourites'
import { createSavedStore } from '@/lib/saved-store'

const favouritesStore = createSavedStore<Favourites>('favourites', parseSavedFavourites, [])

export function useFavourites() {
  const favourites = useSyncExternalStore(favouritesStore.subscribe, favouritesStore.get)
  return {
    favourites,
    isFavourite: (recipePath: string) => favourites.includes(recipePath),
    toggleFavourite: (recipePath: string) => favouritesStore.set((current) => toggleFavourite(current, recipePath)),
  }
}
