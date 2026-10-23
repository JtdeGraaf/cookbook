import { useTranslation } from 'react-i18next'
import { book } from '@/features/book/book-data'
import { FolderRow } from './FolderRow'
import { FolderTree } from './FolderTree'
import { PathBar } from './PathBar'
import './browse.css'

/** The top of the recipes folder: every chapter as a folder. */
export function BrowsePage() {
  const { t } = useTranslation()
  return (
    <>
      <PathBar folderPath="" />
      <div className="browser">
        <aside className="browser__tree">
          <FolderTree currentPath="" />
        </aside>
        <section className="browser__main">
          <h1 className="browse-title">{t('browse.allRecipes')}</h1>
          <p className="browse-intro">{t('browse.intro')}</p>
          <ol className="recipe-rows folder-listing">
            {book.chapters.map((chapter) => (
              <FolderRow key={chapter.path} folder={chapter} />
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
