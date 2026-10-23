import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { Recipe } from '@/lib/book'

/** Turning the pages of the cooking steps: buttons, and the left and right arrow keys. */
export function useStepNavigation(recipe: Recipe, stepNumber: number) {
  const navigate = useNavigate()
  const isFirst = stepNumber === 1
  const isLast = stepNumber === recipe.cook.length
  const params = { chapter: recipe.chapterSlug, recipe: recipe.slug }

  function goToStep(step: number) {
    void navigate({ to: '/$chapter/$recipe/cook/$step', params: { ...params, step: String(step) } })
  }

  function goToPrevious() {
    if (isFirst) return void navigate({ to: '/$chapter/$recipe/prep', params })
    goToStep(stepNumber - 1)
  }

  function goToNext() {
    if (isLast) return void navigate({ to: '/$chapter/$recipe/done', params })
    goToStep(stepNumber + 1)
  }

  // Subscribes again each render so the keys always use the current step.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowLeft') return goToPrevious()
      if (event.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return { isFirst, isLast, goToPrevious, goToNext }
}
