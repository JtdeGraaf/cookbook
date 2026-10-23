import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { allRecipes, type Folder } from '@/lib/book'
import { NO_FILTERS, filterBook, hasFilters, matchesFilters, type RecipeFilters } from '@/lib/filters'
import { useFavourites } from '@/features/favourites/useFavourites'
import { useLocalized } from '@/features/settings/useLanguage'
import { book, pageOf } from './book-data'
import { RecipeFilterBar } from './RecipeFilterBar'
import { RecipeRow } from './RecipeRow'
import './book.css'

type ContentsProps = { filters: RecipeFilters; onFiltersChange: (filters: RecipeFilters) => void }

/** The opening of the book: masthead with a photo collage, then the table of contents, which can be filtered. */
export function Contents({ filters, onFiltersChange }: ContentsProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { favourites } = useFavourites()
  const coverPictures = allRecipes(book).flatMap((recipe) => (recipe.cover ? [recipe.cover] : [])).slice(0, 5)
  const shownBook = filterBook(book, (recipe) => matchesFilters(recipe, filters, favourites))
  return (
    <>
      <section className="masthead">
        <div className="masthead__words">
          <h1 className="masthead__title">{t('book.title')}</h1>
          <p className="masthead__tagline">{t('book.tagline')}</p>
          <p className="masthead__seal" aria-hidden="true">
            <span>{t('book.seal')}</span>
          </p>
        </div>
        <ul className="masthead__collage" aria-hidden="true">
          {coverPictures.map((picture, index) => (
            <li key={picture.file.src} className={`masthead__photo masthead__photo--${index}`}>
              <Photo picture={picture} sizes="(min-width: 760px) 30vw, 50vw" showCredit={false} eager />
            </li>
          ))}
        </ul>
      </section>

      <section className="contents" aria-labelledby="contents-title">
        <div className="contents__heading">
          <h2 id="contents-title" className="contents__title">
            {t('book.contents')}
          </h2>
          <Link to="/browse" className="contents__browse">
            <Icon name="folder" size={20} />
            {t('header.browse')}
          </Link>
        </div>
        <RecipeFilterBar filters={filters} onFiltersChange={onFiltersChange} matchingRecipes={allRecipes(shownBook)} />
        {shownBook.chapters.length === 0 ? (
          <div className="contents__empty">
            <p>{t('filters.noMatches')}</p>
            {hasFilters(filters) && (
              <button type="button" className="button button--quiet" onClick={() => onFiltersChange(NO_FILTERS)}>
                {t('filters.clear')}
              </button>
            )}
          </div>
        ) : (
          <ol className="contents__chapters">
            {shownBook.chapters.map((chapter) => (
              <li key={chapter.path} className="contents__chapter" data-color={chapter.color}>
                <BookLink path={chapter.path} className="contents__band">
                  <span className="contents__band-title">{localized(chapter.title)}</span>
                  <span className="contents__band-page numbers">{t('book.page', { page: pageOf(chapter.path) })}</span>
                </BookLink>
                {chapter.intro && <p className="contents__intro">{localized(chapter.intro)}</p>}
                <FolderContents folder={chapter} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}

/** The recipes of a folder, then each section inside it with its own heading, as deep as the folders go. */
function FolderContents({ folder }: { folder: Folder }) {
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
          <BookLink path={section.path} className="contents__section-head">
            <Icon name="folder" size={18} />
            <span className="contents__section-title">{localized(section.title)}</span>
            <span className="contents__section-page numbers">{t('book.page', { page: pageOf(section.path) })}</span>
          </BookLink>
          <FolderContents folder={section} />
        </div>
      ))}
    </>
  )
}
