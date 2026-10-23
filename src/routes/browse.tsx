import { createFileRoute, redirect } from '@tanstack/react-router'

/** The folder browser became the contents page; old links still land there. */
export const Route = createFileRoute('/browse')({
  beforeLoad: () => {
    throw redirect({ to: '/', replace: true })
  },
})
