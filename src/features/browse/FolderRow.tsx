import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { recipesInside, type Folder } from '@/lib/book'
import { pageOf } from '@/features/book/book-data'
import { useLocalized } from '@/features/settings/useLanguage'
import '@/features/book/book.css'

/** A folder in a folder listing: a coloured folder tile, its name, what is inside, its page. */
export function FolderRow({ folder }: { folder: Folder }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const page = pageOf(folder.path)
  const contents = [
    t('book.recipeCount', { count: recipesInside(folder).length }),
    ...(folder.folders.length > 0 ? [t('browse.folderCount', { count: folder.folders.length })] : []),
  ].join(' · ')
  return (
    <li className="recipe-row recipe-row--large folder-row" data-color={folder.color}>
      <BookLink path={folder.path} className="recipe-row__link">
        <span className="folder-row__tile" aria-hidden="true">
          <Icon name="folder" size={34} />
        </span>
        <span className="recipe-row__text">
          <span className="recipe-row__title">{localized(folder.title)}</span>
          {folder.intro && <span className="recipe-row__summary">{localized(folder.intro)}</span>}
          <span className="recipe-row__meta">{contents}</span>
        </span>
        <span className="recipe-row__leader" aria-hidden="true" />
        {page !== null && <span className="recipe-row__page numbers">{t('book.page', { page })}</span>}
      </BookLink>
    </li>
  )
}
