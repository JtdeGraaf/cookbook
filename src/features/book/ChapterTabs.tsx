import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { useLocalized } from '@/features/settings/useLanguage'
import { book } from './book-data'

/** The coloured thumb index on the edge of the book, one tab per chapter. */
export function ChapterTabs() {
  const { t } = useTranslation()
  const localized = useLocalized()
  // The chapter is the first folder in the address, at any depth below it.
  const currentChapter = useRouterState({ select: (state) => state.location.pathname.split('/')[1] ?? '' })
  return (
    <nav className="chapter-tabs" aria-label={t('header.chapters')}>
      <ul className="chapter-tabs__list">
        {book.chapters.map((chapter) => (
          <li key={chapter.path} data-color={chapter.color}>
            <BookLink
              path={chapter.path}
              className="chapter-tabs__tab"
              aria-current={currentChapter === chapter.slug ? 'page' : undefined}
            >
              {localized(chapter.title)}
            </BookLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
