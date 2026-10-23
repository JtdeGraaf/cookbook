import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Folio } from '@/components/Folio'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import type { Chapter, Recipe } from '@/lib/book'
import { otherLanguage } from '@/lib/language'
import { recipePage } from '@/features/book/book-data'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'
import { ClearTicksButton } from './ClearTicksButton'
import { IngredientBox } from './IngredientBox'
import { Point } from './Point'
import type { RecipeProgressControls } from './useRecipeProgress'
import './cooking.css'

/** Prep tasks are lettered a, b, c… so they never get mixed up with the numbered cooking steps. */
const PREP_LETTERS = 'abcdefghijklmnopqrstuvwxyz'

type RecipeSpreadProps ={ recipe: Recipe; chapter: Chapter; controls: RecipeProgressControls }

/** A recipe as an open book: photo and ingredients on the left page, prep and method on the right. */
export function RecipeSpread({ recipe, chapter, controls }: RecipeSpreadProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const localized = useLocalized()
  const secondLanguage = otherLanguage(language)
  const secondTitle = recipe.title[secondLanguage]
  const startedPrep = controls.progress.donePrepSteps.length > 0
  const recipeParams = { chapter: recipe.chapterSlug, recipe: recipe.slug }

  return (
    <article className="spread">
      <div className="spread__page spread__page--left">
        <Photo picture={recipe.cover} sizes="(min-width: 1024px) 520px, 100vw" className="spread__photo" eager />
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
          {recipe.tags.length > 0 && (
            <ul className="spread__tags">
              {recipe.tags.map((tag) => (
                <li key={tag.en}>{localized(tag)}</li>
              ))}
            </ul>
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
                  {localized(step.text)}
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
                  <p>{localized(step.text)}</p>
                  {step.tip && <Point tip={step.tip} />}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="spread__actions">
          {controls.prepDone ? (
            <Link to="/$chapter/$recipe/cook/$step" params={{ ...recipeParams, step: '1' }} className="button">
              {t('recipe.startCooking')}
              <Icon name="right" />
            </Link>
          ) : (
            <Link to="/$chapter/$recipe/prep" params={recipeParams} className="button">
              {startedPrep ? t('recipe.continuePrep') : t('recipe.startPrep')}
              <Icon name="right" />
            </Link>
          )}
          <ClearTicksButton controls={controls} />
        </div>
      </div>

      <Folio page={recipePage(recipe)} label={localized(chapter.title)} />
    </article>
  )
}
