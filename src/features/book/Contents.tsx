import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { usePageTitle } from '@/components/usePageTitle'
import { allRecipes, type Folder } from '@/lib/book'
import {
  allTags,
  bookAsFiltered,
  filterBook,
  matchesFilters,
  searchFromFilters,
  type FilterSearch,
  type RecipeFilters,
} from '@/lib/filters'
import { BookShell } from '@/features/browse/BookShell'
import { useFavourites } from '@/features/favourites/useFavourites'
import { useLocalized } from '@/features/settings/useLanguage'
import { book, pageOf } from './book-data'
import { NoMatches } from './NoMatches'
import { RecipeFilterBar } from './RecipeFilterBar'
import { RecipeRow } from './RecipeRow'
import './book.css'

type ContentsProps = { filters: RecipeFilters; onFiltersChange: (filters: RecipeFilters) => void }

/** The top of the book: a short title line, then the contents, laid out like every folder page. */
export function Contents({ filters, onFiltersChange }: ContentsProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { favourites } = useFavourites()
  const shownBook = filterBook(book, (recipe) => matchesFilters(recipe, filters, favourites))
  const filterSearch = searchFromFilters(filters)
  usePageTitle(null)
  return (
    <BookShell currentPath="" shownBook={bookAsFiltered(book, filters, favourites, '')} filterSearch={filterSearch}>
      <header className="book-head">
        <div className="book-head__words">
          <h1 className="book-head__title">{t('book.title')}</h1>
          <p className="book-head__tagline">{t('book.tagline')}</p>
        </div>
        <p className="book-head__seal" aria-hidden="true">
          {t('book.seal')}
        </p>
      </header>

      <RecipeFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        matchingRecipes={allRecipes(shownBook)}
        tags={allTags(book)}
      />

      <section aria-label={t('book.contents')}>
        {shownBook.chapters.length === 0 ? (
          <NoMatches />
        ) : (
          <ol className="contents__chapters">
            {shownBook.chapters.map((chapter) => (
              <li key={chapter.path} data-color={chapter.color}>
                <BookLink
                  path={chapter.path}
                  filterSearch={filterSearch}
                  className="contents__section-head contents__section-head--chapter"
                >
                  <Icon name="folder" size={20} />
                  <span className="contents__section-title">{localized(chapter.title)}</span>
                  <span className="contents__section-page numbers">{t('book.page', { page: pageOf(chapter.path) })}</span>
                </BookLink>
                {chapter.intro && <p className="contents__intro">{localized(chapter.intro)}</p>}
                <FolderContents folder={chapter} filterSearch={filterSearch} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </BookShell>
  )
}

/** The recipes of a folder, then each section inside it with its own heading, as deep as the folders go. */
function FolderContents({ folder, filterSearch }: { folder: Folder; filterSearch: FilterSearch }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <>
      {folder.recipes.length > 0 && (
        <ol className="recipe-rows">
          {folder.recipes.map((recipe) => (
            <RecipeRow key={recipe.path} recipe={recipe} />
          ))}
        </ol>
      )}
      {folder.folders.map((section) => (
        <div key={section.path} className="contents__section">
          <BookLink path={section.path} filterSearch={filterSearch} className="contents__section-head">
            <Icon name="folder" size={18} />
            <span className="contents__section-title">{localized(section.title)}</span>
            <span className="contents__section-page numbers">{t('book.page', { page: pageOf(section.path) })}</span>
          </BookLink>
          <FolderContents folder={section} filterSearch={filterSearch} />
        </div>
      ))}
    </>
  )
}
