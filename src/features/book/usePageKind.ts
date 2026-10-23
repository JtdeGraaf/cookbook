import { useRouterState } from '@tanstack/react-router'
import { pageKindFor, type PageKind } from '@/lib/page-kind'

export function usePageKind(): PageKind {
  return useRouterState({ select: (state) => pageKindFor(state.location.pathname) })
}
