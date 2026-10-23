import { Folio } from '@/components/Folio'
import type { Folder } from '@/lib/book'
import { pageOf } from '@/features/book/book-data'
import { ChapterBand } from '@/features/book/ChapterBand'
import { RecipeRow } from '@/features/book/RecipeRow'
import { useLocalized } from '@/features/settings/useLanguage'
import { AddRecipeLink } from './AddRecipeLink'
import { FolderRow } from './FolderRow'
import { FolderTree } from './FolderTree'
import { PathBar } from './PathBar'
import './browse.css'

/** A folder of the book: its band, then what is inside it, with the whole tree beside it on wide screens. */
export function FolderPage({ folder }: { folder: Folder }) {
  const localized = useLocalized()
  return (
    <div data-color={folder.color}>
      <PathBar folderPath={folder.path} />
      <div className="browser">
        <aside className="browser__tree">
          <FolderTree currentPath={folder.path} />
        </aside>
        <article className="browser__main">
          <ChapterBand folder={folder} />
          <ol className="recipe-rows folder-listing">
            {folder.folders.map((child) => (
              <FolderRow key={child.path} folder={child} />
            ))}
            {folder.recipes.map((recipe, index) => (
              <RecipeRow key={recipe.path} recipe={recipe} large eager={index < 4} />
            ))}
          </ol>
          <AddRecipeLink folderPath={folder.path} />
          <Folio page={pageOf(folder.path)} label={localized(folder.title)} />
        </article>
      </div>
    </div>
  )
}
