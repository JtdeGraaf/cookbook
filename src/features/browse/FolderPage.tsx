import { Folio } from '@/components/Folio'
import { usePageTitle } from '@/components/usePageTitle'
import type { Folder } from '@/lib/book'
import { pageOf } from '@/features/book/book-data'
import { RecipeRow } from '@/features/book/RecipeRow'
import { useLocalized } from '@/features/settings/useLanguage'
import { AddRecipeLink } from './AddRecipeLink'
import { BookShell } from './BookShell'
import { FolderHead } from './FolderHead'
import { FolderRow } from './FolderRow'
import { PathBar } from './PathBar'

/** A folder of the book, laid out like the contents page: the way here, a title line, then what is inside. */
export function FolderPage({ folder }: { folder: Folder }) {
  const localized = useLocalized()
  usePageTitle(localized(folder.title))
  return (
    <div data-color={folder.color}>
      <BookShell currentPath={folder.path}>
        <PathBar folderPath={folder.path} />
        <FolderHead folder={folder} />
        <ol className="recipe-rows folder-listing">
          {folder.recipes.map((recipe, index) => (
            <RecipeRow key={recipe.path} recipe={recipe} showSummary eager={index < 6} />
          ))}
          {folder.folders.map((child) => (
            <FolderRow key={child.path} folder={child} />
          ))}
        </ol>
        <AddRecipeLink folderPath={folder.path} />
        <Folio page={pageOf(folder.path)} label={localized(folder.title)} />
      </BookShell>
    </div>
  )
}
