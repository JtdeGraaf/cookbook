import { useState } from 'react'
import { parentPaths } from '@/lib/book'

/** Which folders are open in the tree. The folders on the way to the current page are always opened. */
export function useExpandedFolders(currentPath: string) {
  const [expanded, setExpanded] = useState(() => new Set(parentPaths(currentPath)))
  const [openedFor, setOpenedFor] = useState(currentPath)

  if (openedFor !== currentPath) {
    setOpenedFor(currentPath)
    setExpanded((current) => new Set([...current, ...parentPaths(currentPath)]))
  }

  function toggle(path: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return { isOpen: (path: string) => expanded.has(path), toggle }
}
