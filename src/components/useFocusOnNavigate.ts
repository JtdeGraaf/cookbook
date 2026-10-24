import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, type RefObject } from 'react'

/**
 * Moves keyboard and screen-reader focus to the new page after navigating, the way a full page load would. Skipped
 * while the reader is typing, so the search box keeps focus as its results page opens.
 */
export function useFocusOnNavigate(page: RefObject<HTMLElement | null>) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const firstPage = useRef(true)

  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false
      return
    }
    if (document.activeElement instanceof HTMLInputElement) return
    page.current?.focus({ preventScroll: true })
  }, [pathname, page])
}
