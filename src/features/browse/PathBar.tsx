import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { folderTrail } from '@/lib/book'
import type { FilterSearch } from '@/lib/filters'
import { book } from '@/features/book/book-data'
import { useLocalized } from '@/features/settings/useLanguage'

type PathBarProps = {
  /** The folder to show the way to; "" for the top. */
  folderPath: string
  /** The page itself when it isn't a folder, like a recipe title. Shown last, not a link. */
  currentTitle?: string
  /** The filters of a folder page, carried over by the links above it. */
  filterSearch?: FilterSearch
}

/** Where you are in the recipes folder, like the address bar of a file browser. Every part is clickable. */
export function PathBar({ folderPath, currentTitle, filterSearch = {} }: PathBarProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const trail = folderTrail(book, folderPath)
  return (
    <nav className="path-bar" aria-label={t('browse.pathLabel')}>
      <ol className="path-bar__list">
        <li className="path-bar__part">
          <Link
            to="/"
            search={filterSearch}
            activeOptions={{ exact: true, includeSearch: false }}
            className="path-bar__link"
            aria-current={trail.length === 0 && !currentTitle ? 'page' : undefined}
          >
            <Icon name="folder" size={18} />
            {t('browse.allRecipes')}
          </Link>
        </li>
        {trail.map((folder, index) => (
          <li key={folder.path} className="path-bar__part">
            <BookLink
              path={folder.path}
              filterSearch={filterSearch}
              className="path-bar__link"
              aria-current={index === trail.length - 1 && !currentTitle ? 'page' : undefined}
            >
              {localized(folder.title)}
            </BookLink>
          </li>
        ))}
        {currentTitle && (
          <li className="path-bar__part">
            <span className="path-bar__current" aria-current="page">
              {currentTitle}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}
