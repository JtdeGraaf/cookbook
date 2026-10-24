import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { nearestFolder, searchTermForMissingPage } from '@/lib/book'
import { book } from '@/features/book/book-data'
import { useLocalized } from '@/features/settings/useLanguage'
import { BookLink } from './BookLink'
import { EmptyState } from './EmptyState'
import { usePageTitle } from './usePageTitle'

/** A page that isn't in the book: offers the nearest folder that is, a search for the missing part, and the contents. */
export function NotFound() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const folder = nearestFolder(book, pathname)
  const searchTerm = searchTermForMissingPage(book, pathname)
  usePageTitle(t('notFound.title'))
  return (
    <EmptyState
      title={t('notFound.title')}
      hint={t('notFound.body')}
      action={
        <>
          {folder ? (
            <BookLink path={folder.path} className="button">
              {t('notFound.nearest', { name: localized(folder.title) })}
            </BookLink>
          ) : (
            <Link to="/" className="button">
              {t('book.backToContents')}
            </Link>
          )}
          <Link to="/search" search={{ q: searchTerm }} className="button button--quiet">
            {t('notFound.search')}
          </Link>
        </>
      }
    />
  )
}
