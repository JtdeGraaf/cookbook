import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { recipeViewPath, type Recipe, type RecipeView } from '@/lib/book'

/** Turning the pages of the cooking steps: buttons, and the left and right arrow keys. */
export function useStepNavigation(recipe: Recipe, stepNumber: number) {
  const navigate = useNavigate()
  const isFirst = stepNumber === 1
  const isLast = stepNumber === recipe.cook.length

  function goTo(view: RecipeView) {
    void navigate({ to: '/$', params: { _splat: recipeViewPath(recipe, view) } })
  }

  function goToPrevious() {
    goTo(isFirst ? { name: 'prep' } : { name: 'cook', stepNumber: stepNumber - 1 })
  }

  function goToNext() {
    goTo(isLast ? { name: 'done' } : { name: 'cook', stepNumber: stepNumber + 1 })
  }

  // Subscribes again each render so the keys always use the current step.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (typing || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowLeft') return goToPrevious()
      if (event.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return { isFirst, isLast, goToPrevious, goToNext }
}
