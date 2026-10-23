import { createFileRoute } from '@tanstack/react-router'
import { BrowsePage } from '@/features/browse/BrowsePage'

export const Route = createFileRoute('/browse')({
  component: BrowsePage,
})
