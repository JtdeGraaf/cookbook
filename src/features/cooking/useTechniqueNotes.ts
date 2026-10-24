import { useId, useState } from 'react'

/** Which technique explanations under one step are open. They all start closed and nothing is remembered. */
export function useTechniqueNotes() {
  const [openIds, setOpenIds] = useState<string[]>([])
  const idPrefix = useId()

  return {
    isOpen: (techniqueId: string) => openIds.includes(techniqueId),
    toggle: (techniqueId: string) =>
      setOpenIds((ids) => (ids.includes(techniqueId) ? ids.filter((id) => id !== techniqueId) : [...ids, techniqueId])),
    /** The element id of a technique's explanation, for the button's aria-controls. */
    noteId: (techniqueId: string) => `${idPrefix}technique-${techniqueId}`,
  }
}

export type TechniqueNotesControls = ReturnType<typeof useTechniqueNotes>
