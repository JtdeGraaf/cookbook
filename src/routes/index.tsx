import { createFileRoute } from '@tanstack/react-router'
import { Contents } from '@/features/book/Contents'

export const Route = createFileRoute('/')({
  component: Contents,
})
