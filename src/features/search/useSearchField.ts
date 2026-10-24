import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

/**
 * The header search box: typing opens the search page, "/" jumps to the box from anywhere, and arriving on an empty
 * search page puts the cursor in the box, so the phone's search icon needs one tap.
 */
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
      // On a phone's recipe pages the box is folded away; open the search page, where it shows.
      if (!isShown(input.current)) return void navigate({ to: '/search', search: { q: '' } })
      input.current?.focus()
    }
    window.addEventListener('keydown', focusOnSlash)
    return () => window.removeEventListener('keydown', focusOnSlash)
  }, [navigate])

  // Only on arriving at the search page, not on every keystroke there.
  useEffect(() => {
    const box = input.current
    if (isOnSearchPage && box && box.value === '' && isShown(box)) box.focus()
  }, [isOnSearchPage])

  function changeQuery(next: string) {
    void navigate({ to: '/search', search: { q: next }, replace: isOnSearchPage })
  }

  return { input, query, changeQuery }
}

function readQuery(search: unknown): string {
  if (typeof search !== 'object' || search === null || !('q' in search)) return ''
  return typeof search.q === 'string' ? search.q : ''
}

function isShown(element: HTMLElement | null): boolean {
  return element !== null && element.offsetParent !== null
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName))
}
