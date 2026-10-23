import { useTranslation } from 'react-i18next'
import { Photo } from '@/components/Photo'
import { recipesInside, type Folder } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import './book.css'

/**
 * The opening of a folder: a full band of chapter colour with its lead dish cut into a circle. Sections inside a
 * chapter get a lighter band, so you can tell a chapter from a section at a glance.
 */
export function ChapterBand({ folder }: { folder: Folder }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const isSection = folder.path.includes('/')
  const leadPhoto = recipesInside(folder).find((recipe) => recipe.cover)?.cover ?? null
  return (
    <header className={isSection ? 'chapter-opener chapter-opener--section' : 'chapter-opener'}>
      <div className="chapter-opener__words">
        <h1 className="chapter-opener__title">{localized(folder.title)}</h1>
        {folder.intro && <p className="chapter-opener__intro">{localized(folder.intro)}</p>}
        <p className="chapter-opener__count">{t('book.recipeCount', { count: recipesInside(folder).length })}</p>
      </div>
      {leadPhoto && (
        <Photo
          picture={leadPhoto}
          sizes="(min-width: 760px) 360px, 60vw"
          className="chapter-opener__dish"
          showCredit={false}
          eager
        />
      )}
    </header>
  )
}
