import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { nearestFolderOrRecipe, searchTermForMissingPage } from '@/lib/book'
import { book } from '@/features/book/book-data'
import { useLocalized } from '@/features/settings/useLanguage'
import { BookLink } from './BookLink'
import { EmptyState } from './EmptyState'
import { usePageTitle } from './usePageTitle'

/** A page that isn't in the book: offers the nearest folder or recipe, a search for the missing part, and the contents. */
export function NotFound() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const nearest = nearestFolderOrRecipe(book, pathname)
  const searchTerm = searchTermForMissingPage(book, pathname)
  usePageTitle(t('notFound.title'))
  return (
    <EmptyState
      title={t('notFound.title')}
      hint={t('notFound.body')}
      action={
        <>
          {nearest ? (
            <BookLink path={nearest.path} className="button">
              {t('notFound.nearest', { name: localized(nearest.title) })}
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
