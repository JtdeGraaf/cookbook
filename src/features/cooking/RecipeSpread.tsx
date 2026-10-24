import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { CoverImage } from '@/components/CoverImage'
import { Folio } from '@/components/Folio'
import { Icon } from '@/components/Icon'
import { folderTrail, recipeViewPath, type Recipe } from '@/lib/book'
import { tagKey } from '@/lib/filters'
import { otherLanguage } from '@/lib/language'
import { book, pageOf } from '@/features/book/book-data'
import { PathBar } from '@/features/browse/PathBar'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'
import { ClearTicksButton } from './ClearTicksButton'
import { IngredientBox } from './IngredientBox'
import { OriginalRecipe } from './OriginalRecipe'
import { Point } from './Point'
import { RecipeActions } from './RecipeActions'
import { StepText } from './StepText'
import { TimesCooked } from './TimesCooked'
import type { RecipeProgressControls } from './useRecipeProgress'
import './cooking.css'

/** Prep tasks are lettered a, b, c… so they never get mixed up with the numbered cooking steps. */
const PREP_LETTERS = 'abcdefghijklmnopqrstuvwxyz'

type RecipeSpreadProps = {
  recipe: Recipe
  controls: RecipeProgressControls
  /** Servings this visit opened with from a shared link, to say why the numbers changed. */
  sharedServings: number | null
}

/** A recipe as an open book: photo and ingredients on the left page, prep and method on the right. */
export function RecipeSpread({ recipe, controls, sharedServings }: RecipeSpreadProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const localized = useLocalized()
  const secondLanguage = otherLanguage(language)
  const secondTitle = recipe.title[secondLanguage]
  const startedPrep = controls.progress.donePrepSteps.length > 0
  const folder = folderTrail(book, recipe.folderPath).at(-1)

  return (
    <>
      <PathBar folderPath={recipe.folderPath} currentTitle={localized(recipe.title)} />
      <article className="spread">
        <div className="spread__page spread__page--left">
          <CoverImage recipe={recipe} sizes="(min-width: 1024px) 520px, 100vw" className="spread__photo" eager />
          <IngredientBox recipe={recipe} controls={controls} />
        </div>

        <div className="spread__page spread__page--right">
          <header className="spread__head">
            <h1 className="spread__title">{localized(recipe.title)}</h1>
            {secondTitle !== localized(recipe.title) && (
              <p className="spread__second-title" lang={secondLanguage}>
                {secondTitle}
              </p>
            )}
            <p className="spread__summary">{localized(recipe.summary)}</p>
            <OriginalRecipe recipe={recipe} />
            <dl className="spread__times">
              <div>
                <dt>{t('recipe.prepTime')}</dt>
                <dd className="numbers">{t('book.minutes', { count: recipe.prepMinutes })}</dd>
              </div>
              <div>
                <dt>{t('recipe.cookTime')}</dt>
                <dd className="numbers">{t('book.minutes', { count: recipe.cookMinutes })}</dd>
              </div>
            </dl>
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
            <RecipeActions recipe={recipe} servings={controls.servings} />
            {sharedServings !== null && (
              <p className="spread__shared-note">{t('recipe.sharedServings', { count: sharedServings })}</p>
            )}
          </header>

          <section className="before-heat" aria-labelledby="before-heat-title">
            <h2 id="before-heat-title" className="before-heat__title">
              {t('recipe.prepTitle')}
            </h2>
            <ol className="before-heat__list">
              {recipe.prep.map((step, index) => {
                const done = controls.progress.donePrepSteps.includes(index)
                return (
                  <li key={index} data-done={done}>
                    <span className="before-heat__marker" aria-hidden="true">
                      {done ? <Icon name="check" size={16} /> : PREP_LETTERS[index]}
                    </span>
                    <StepText step={step} />
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="method" aria-labelledby="method-title">
            <h2 id="method-title" className="method__title">
              {t('recipe.methodTitle')}
            </h2>
            <ol className="method__list">
              {recipe.cook.map((step, index) => (
                <li key={index} className="method__step">
                  <span className="method__number numbers" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="method__body">
                    <StepText step={step} />
                    {step.tip && <Point tip={step.tip} />}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="spread__actions">
            {controls.prepDone ? (
              <BookLink path={recipeViewPath(recipe, { name: 'cook', stepNumber: 1 })} className="button">
                {t('recipe.startCooking')}
                <Icon name="right" />
              </BookLink>
            ) : (
              <BookLink path={recipeViewPath(recipe, { name: 'prep' })} className="button">
                {startedPrep ? t('recipe.continuePrep') : t('recipe.startPrep')}
                <Icon name="right" />
              </BookLink>
            )}
            <ClearTicksButton controls={controls} />
          </div>
        </div>

        <Folio page={pageOf(recipe.path)} label={folder ? localized(folder.title) : ''} />
      </article>
    </>
  )
}
