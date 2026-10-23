import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

/** The header search box: typing opens the search page, "/" jumps to the box from anywhere. */
export function useSearchField() {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const location = useRouterState({ select: (state) => state.location })
  const isOnSearchPage = location.pathname === '/search'
  const query = isOnSearchPage ? readQuery(location.search) : ''

  useEffect(() => {
    function focusOnSlash(event: KeyboardEvent) {
      if (event.key !== '/' || isTyping(event.target)) return
      event.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', focusOnSlash)
    return () => window.removeEventListener('keydown', focusOnSlash)
  }, [])

  function changeQuery(next: string) {
    void navigate({ to: '/search', search: { q: next }, replace: isOnSearchPage })
  }

  return { input, query, changeQuery }
}

function readQuery(search: unknown): string {
  if (typeof search !== 'object' || search === null || !('q' in search)) return ''
  return typeof search.q === 'string' ? search.q : ''
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName))
}
