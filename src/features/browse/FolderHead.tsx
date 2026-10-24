import { useTranslation } from 'react-i18next'
import { recipesInside, type Folder } from '@/lib/book'
import { pageOf } from '@/features/book/book-data'
import { useLocalized } from '@/features/settings/useLanguage'
import '@/features/book/book.css'

/** The head of a folder page: a plain title line like the contents page has, with what is inside and its page. */
export function FolderHead({ folder }: { folder: Folder }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const page = pageOf(folder.path)
  return (
    <header className="book-head folder-head">
      <div className="book-head__words">
        <h1 className="book-head__title">{localized(folder.title)}</h1>
        {folder.intro && <p className="book-head__tagline">{localized(folder.intro)}</p>}
        <p className="folder-head__meta">
          {t('book.recipeCount', { count: recipesInside(folder).length })}
          {page !== null && <span className="folder-head__page numbers">{t('book.page', { page })}</span>}
        </p>
      </div>
    </header>
  )
}
