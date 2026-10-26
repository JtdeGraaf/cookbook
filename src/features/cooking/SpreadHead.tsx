import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/lib/book'
import { tagKey } from '@/lib/filters'
import { otherLanguage } from '@/lib/language'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'
import { OriginalRecipe } from './OriginalRecipe'
import { RecipeActions } from './RecipeActions'
import { TimesCooked } from './TimesCooked'

type SpreadHeadProps = {
  recipe: Recipe
  servings: number
  /** Servings this visit opened with from a shared link, to say why the numbers changed. */
  sharedServings: number | null
  /** The pills under the summary: times for a dish; mix, glass and ice for a drink. */
  facts: ReactNode
}

/** The title block of a recipe spread, the same for a dish and a drink apart from its facts. */
export function SpreadHead({ recipe, servings, sharedServings, facts }: SpreadHeadProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const localized = useLocalized()
  const secondLanguage = otherLanguage(language)
  const secondTitle = recipe.title[secondLanguage]
  const sharedNoteKey = recipe.kind === 'drink' ? 'recipe.sharedDrinks' : 'recipe.sharedServings'
  return (
    <header className="spread__head">
      <h1 className="spread__title">{localized(recipe.title)}</h1>
      {secondTitle !== localized(recipe.title) && (
        <p className="spread__second-title" lang={secondLanguage}>
          {secondTitle}
        </p>
      )}
      <p className="spread__summary">{localized(recipe.summary)}</p>
      <OriginalRecipe recipe={recipe} />
      <dl className="spread__times">{facts}</dl>
      <TimesCooked recipe={recipe} />
      {recipe.tags.length > 0 && (
        <ul className="spread__tags">
          {recipe.tags.map((tag) => (
            <li key={tag.en}>
              <Link to="/" search={{ tag: tagKey(tag) }} className="spread__tag">
                {localized(tag)}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <RecipeActions recipe={recipe} servings={servings} />
      {sharedServings !== null && <p className="spread__shared-note">{t(sharedNoteKey, { count: sharedServings })}</p>}
    </header>
  )
}
