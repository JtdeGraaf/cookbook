import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { recipeViewPath, type Dish, type RecipeView } from '@/lib/book'
import { finishCooking } from './finish-cooking'

/**
 * Turning the pages of the cooking steps: buttons, and the left and right arrow keys. Finishing the last step
 * closes the cooking session; an arrow key never does that by accident.
 */
export function useStepNavigation(recipe: Dish, stepNumber: number) {
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
    if (!isLast) return goTo({ name: 'cook', stepNumber: stepNumber + 1 })
    finishCooking(recipe)
    goTo({ name: 'done' })
  }

  // Subscribes again each render so the keys always use the current step.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (typing || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowLeft') return goToPrevious()
      if (event.key === 'ArrowRight' && !isLast) goToNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return { isFirst, isLast, goToPrevious, goToNext }
}
