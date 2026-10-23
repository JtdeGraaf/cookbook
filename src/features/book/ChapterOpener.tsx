import { useTranslation } from 'react-i18next'
import { Folio } from '@/components/Folio'
import { Photo } from '@/components/Photo'
import type { Chapter } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { chapterPage } from './book-data'
import { RecipeRow } from './RecipeRow'
import './book.css'

/** The first page of a chapter: a full band of chapter colour with its lead dish, then the chapter's own contents. */
export function ChapterOpener({ chapter }: { chapter: Chapter }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const leadRecipe = chapter.recipes[0]
  return (
    <article data-color={chapter.color}>
      <header className="chapter-opener">
        <div className="chapter-opener__words">
          <h1 className="chapter-opener__title">{localized(chapter.title)}</h1>
          {chapter.intro && <p className="chapter-opener__intro">{localized(chapter.intro)}</p>}
          <p className="chapter-opener__count">{t('book.recipeCount', { count: chapter.recipes.length })}</p>
        </div>
        <Photo
          picture={leadRecipe.cover}
          sizes="(min-width: 760px) 360px, 60vw"
          className="chapter-opener__dish"
          showCredit={false}
          eager
        />
      </header>

      <ol className="recipe-rows chapter-recipes">
        {chapter.recipes.map((recipe, index) => (
          <RecipeRow key={recipe.slug} recipe={recipe} large eager={index < 4} />
        ))}
      </ol>

      <Folio page={chapterPage(chapter)} label={localized(chapter.title)} />
    </article>
  )
}
