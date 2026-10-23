import { useEffect, useRef } from 'react'
import type { RecipeProgressControls } from './useRecipeProgress'

/**
 * A shared link like `?servings=6` sets the servings once; then the number is taken out of the address so a
 * reload doesn't undo a change the cook made afterwards.
 */
export function useLinkedServings(
  controls: RecipeProgressControls,
  linkedServings: number | null,
  onLinkedServingsUsed: () => void,
) {
  // Remembers which link value was applied, so the change it causes doesn't apply it again.
  const applied = useRef<number | null>(null)

  useEffect(() => {
    if (linkedServings === null) {
      applied.current = null
      return
    }
    if (applied.current === linkedServings) return
    applied.current = linkedServings
    controls.setServings(linkedServings)
    onLinkedServingsUsed()
  })
}
