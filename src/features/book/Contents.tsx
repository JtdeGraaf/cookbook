import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Photo } from '@/components/Photo'
import { allRecipes } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { book, chapterPage } from './book-data'
import { RecipeRow } from './RecipeRow'
import './book.css'

/** The opening of the book: masthead with a photo collage, then the table of contents. */
export function Contents() {
  const { t } = useTranslation()
  const localized = useLocalized()
  const coverRecipes = allRecipes(book).slice(0, 5)
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
          {coverRecipes.map((recipe, index) => (
            <li key={`${recipe.chapterSlug}/${recipe.slug}`} className={`masthead__photo masthead__photo--${index}`}>
              <Photo picture={recipe.cover} sizes="(min-width: 760px) 30vw, 50vw" showCredit={false} eager />
            </li>
          ))}
        </ul>
      </section>

      <section className="contents" aria-labelledby="contents-title">
        <h2 id="contents-title" className="contents__title">
          {t('book.contents')}
        </h2>
        <ol className="contents__chapters">
          {book.chapters.map((chapter) => (
            <li key={chapter.slug} className="contents__chapter" data-color={chapter.color}>
              <Link to="/$chapter" params={{ chapter: chapter.slug }} className="contents__band">
                <span className="contents__band-title">{localized(chapter.title)}</span>
                <span className="contents__band-page numbers">{t('book.page', { page: chapterPage(chapter) })}</span>
              </Link>
              {chapter.intro && <p className="contents__intro">{localized(chapter.intro)}</p>}
              <ol className="recipe-rows">
                {chapter.recipes.map((recipe) => (
                  <RecipeRow key={recipe.slug} recipe={recipe} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
