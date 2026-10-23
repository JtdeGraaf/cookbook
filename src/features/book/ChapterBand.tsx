import { useTranslation } from 'react-i18next'
import { recipesInside, type Folder } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { pageOf } from './book-data'
import './book.css'

/**
 * The head of a folder page: the same coloured band the contents page lists the chapter with, opened up to hold
 * its intro. Sections inside a chapter get a lighter band, so a chapter and a section are told apart at a glance.
 */
export function ChapterBand({ folder }: { folder: Folder }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const isSection = folder.path.includes('/')
  return (
    <header className={isSection ? 'folder-band folder-band--section' : 'folder-band'}>
      <div className="folder-band__top">
        <h1 className="folder-band__title">{localized(folder.title)}</h1>
        <span className="folder-band__page numbers">{t('book.page', { page: pageOf(folder.path) })}</span>
      </div>
      {folder.intro && <p className="folder-band__intro">{localized(folder.intro)}</p>}
      <p className="folder-band__count">{t('book.recipeCount', { count: recipesInside(folder).length })}</p>
    </header>
  )
}
