import { Folio } from '@/components/Folio'
import { usePageTitle } from '@/components/usePageTitle'
import { recipesInside, type Folder } from '@/lib/book'
import { filterBook, folderAsFiltered, hasFilters, matchesFilters, tagsUsedIn, type RecipeFilters } from '@/lib/filters'
import { book, pageOf } from '@/features/book/book-data'
import { NoMatches } from '@/features/book/NoMatches'
import { RecipeFilterBar } from '@/features/book/RecipeFilterBar'
import { RecipeRow } from '@/features/book/RecipeRow'
import { useFavourites } from '@/features/favourites/useFavourites'
import { useLocalized } from '@/features/settings/useLanguage'
import { AddRecipeLink } from './AddRecipeLink'
import { BookShell } from './BookShell'
import { FolderHead } from './FolderHead'
import { FolderRow } from './FolderRow'
import { PathBar } from './PathBar'

type FolderPageProps = {
  folder: Folder
  filters: RecipeFilters
  onFiltersChange: (filters: RecipeFilters) => void
}

/** A folder of the book, laid out like the contents page: the way here, a title line, filters, then what is inside. */
export function FolderPage({ folder, filters, onFiltersChange }: FolderPageProps) {
  const localized = useLocalized()
  const { favourites } = useFavourites()
  const shownFolder = folderAsFiltered(folder, filters, favourites)
  const matchingRecipes = recipesInside(shownFolder)
  usePageTitle(localized(folder.title))
  return (
    <div data-color={folder.color}>
      <BookShell
        currentPath={folder.path}
        shownBook={filterBook(book, (recipe) => matchesFilters(recipe, filters, favourites))}
      >
        <PathBar folderPath={folder.path} />
        <FolderHead folder={folder} />
        <RecipeFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          matchingRecipes={matchingRecipes}
          tags={tagsUsedIn(recipesInside(folder))}
        />
        {hasFilters(filters) && matchingRecipes.length === 0 ? (
          <NoMatches filters={filters} onFiltersChange={onFiltersChange} />
        ) : (
          <ol className="recipe-rows folder-listing">
            {shownFolder.recipes.map((recipe, index) => (
              <RecipeRow key={recipe.path} recipe={recipe} showSummary eager={index < 6} />
            ))}
            {shownFolder.folders.map((child) => (
              <FolderRow key={child.path} folder={child} />
            ))}
          </ol>
        )}
        <AddRecipeLink folderPath={folder.path} />
        <Folio page={pageOf(folder.path)} label={localized(folder.title)} />
      </BookShell>
    </div>
  )
}
