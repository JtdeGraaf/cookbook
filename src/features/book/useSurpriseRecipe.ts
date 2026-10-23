import { useNavigate } from '@tanstack/react-router'
import type { Recipe } from '@/lib/book'
import { pickRandomRecipe } from '@/lib/filters'

/** Opens a random recipe from `recipes`. */
export function useSurpriseRecipe(recipes: Recipe[]): () => void {
  const navigate = useNavigate()
  return () => {
    const recipe = pickRandomRecipe(recipes, Math.random)
    if (!recipe) return
    void navigate({ to: '/$', params: { _splat: recipe.path } })
  }
}
