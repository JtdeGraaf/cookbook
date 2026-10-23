import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLocalized } from '@/features/settings/useLanguage'
import { book } from './book-data'

/** The coloured thumb index on the edge of the book, one tab per chapter. */
export function ChapterTabs() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const params = useParams({ strict: false })
  return (
    <nav className="chapter-tabs" aria-label={t('header.chapters')}>
      <ul className="chapter-tabs__list">
        {book.chapters.map((chapter) => (
          <li key={chapter.slug} data-color={chapter.color}>
            <Link
              to="/$chapter"
              params={{ chapter: chapter.slug }}
              className="chapter-tabs__tab"
              aria-current={params.chapter === chapter.slug ? 'page' : undefined}
            >
              {localized(chapter.title)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
