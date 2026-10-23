import { createFileRoute } from '@tanstack/react-router'
import { ChapterOpener } from '@/features/book/ChapterOpener'
import { chapterOrNotFound } from '@/features/book/find-in-book'

export const Route = createFileRoute('/$chapter/')({
  loader: ({ params }) => ({ chapter: chapterOrNotFound(params.chapter) }),
  component: ChapterPage,
})

function ChapterPage() {
  const { chapter } = Route.useLoaderData()
  return <ChapterOpener chapter={chapter} />
}
