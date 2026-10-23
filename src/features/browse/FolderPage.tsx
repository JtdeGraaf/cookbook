import { Folio } from '@/components/Folio'
import type { Folder } from '@/lib/book'
import { pageOf } from '@/features/book/book-data'
import { ChapterBand } from '@/features/book/ChapterBand'
import { RecipeRow } from '@/features/book/RecipeRow'
import { useLocalized } from '@/features/settings/useLanguage'
import { AddRecipeLink } from './AddRecipeLink'
import { BookShell } from './BookShell'
import { FolderRow } from './FolderRow'
import { PathBar } from './PathBar'

/** A folder of the book, laid out like the contents page: the way here, the folder's band, then what is inside. */
export function FolderPage({ folder }: { folder: Folder }) {
  const localized = useLocalized()
  return (
    <div data-color={folder.color}>
      <BookShell currentPath={folder.path}>
        <PathBar folderPath={folder.path} />
        <ChapterBand folder={folder} />
        <ol className="recipe-rows folder-listing">
          {folder.folders.map((child) => (
            <FolderRow key={child.path} folder={child} />
          ))}
          {folder.recipes.map((recipe, index) => (
            <RecipeRow key={recipe.path} recipe={recipe} showSummary eager={index < 6} />
          ))}
        </ol>
        <AddRecipeLink folderPath={folder.path} />
        <Folio page={pageOf(folder.path)} label={localized(folder.title)} />
      </BookShell>
    </div>
  )
}
