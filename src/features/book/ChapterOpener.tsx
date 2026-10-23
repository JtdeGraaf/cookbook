import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Folio } from '@/components/Folio'
import { Photo } from '@/components/Photo'
import type { Chapter } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { chapterPage, recipePage } from './book-data'
import './book.css'

/** The first page of a chapter: a full band of chapter colour, then its recipes as plates. */
export function ChapterOpener({ chapter }: { chapter: Chapter }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <article data-color={chapter.color}>
      <header className="chapter-opener">
        <h1 className="chapter-opener__title">{localized(chapter.title)}</h1>
        {chapter.intro && <p className="chapter-opener__intro">{localized(chapter.intro)}</p>}
        <p className="chapter-opener__count">{t('book.recipeCount', { count: chapter.recipes.length })}</p>
      </header>

      <ol className="plates">
        {chapter.recipes.map((recipe) => (
          <li key={recipe.slug} className="plate">
            <Link to="/$chapter/$recipe" params={{ chapter: chapter.slug, recipe: recipe.slug }} className="plate__link">
              <Photo picture={recipe.cover} sizes="(min-width: 760px) 45vw, 100vw" showCredit={false} />
              <span className="plate__page numbers">{recipePage(recipe)}</span>
              <span className="plate__title">{localized(recipe.title)}</span>
              <span className="plate__summary">{localized(recipe.summary)}</span>
              <span className="plate__time">
                {t('book.totalTime', { count: recipe.prepMinutes + recipe.cookMinutes })}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Folio page={chapterPage(chapter)} label={localized(chapter.title)} />
    </article>
  )
}
