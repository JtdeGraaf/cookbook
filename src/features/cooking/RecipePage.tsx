import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { usePageTitle } from '@/components/usePageTitle'
import { recipeViewPath, type Dish, type Drink, type Recipe, type RecipeView } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { CookStep } from './CookStep'
import { DrinkSpread } from './DrinkSpread'
import { wasCookedToday } from './finish-cooking'
import { Finished } from './Finished'
import { PrepChecklist } from './PrepChecklist'
import { focusFirstOpenPrepTask } from './prep-task-focus'
import { RecipeGate } from './RecipeGate'
import { RecipeSpread } from './RecipeSpread'
import { RecipeWorkspace } from './RecipeWorkspace'
import { useLinkedServings } from './useLinkedServings'
import { useRecipeJournal } from './useRecipeJournal'
import { useRecipeProgress, type RecipeProgressControls } from './useRecipeProgress'
import { useStepNavigation } from './useStepNavigation'

type RecipePageProps = {
  recipe: Recipe
  view: RecipeView
  /** Servings from a shared link (`?servings=6`), or null. */
  linkedServings: number | null
  onLinkedServingsUsed: () => void
}

/**
 * Every page of one recipe. Ticks and servings are the recipe's one shared record, so they carry over everywhere. A
 * drink has just the one page.
 */
export function RecipePage({ recipe, view, linkedServings, onLinkedServingsUsed }: RecipePageProps) {
  const controls = useRecipeProgress(recipe)
  // Remembered for this visit, so the note about the shared link stays after the address is cleaned up.
  const [sharedServings] = useState(linkedServings)
  useLinkedServings(controls, linkedServings, onLinkedServingsUsed)
  return (
    <div data-color={recipe.color}>
      {recipe.kind === 'drink' ? (
        <DrinkView recipe={recipe} controls={controls} sharedServings={sharedServings} />
      ) : (
        <RecipeViewContent recipe={recipe} view={view} controls={controls} sharedServings={sharedServings} />
      )}
    </div>
  )
}

type ViewProps = { recipe: Dish; controls: RecipeProgressControls }

type RecipeViewContentProps = ViewProps & { view: RecipeView; sharedServings: number | null }

function RecipeViewContent({ recipe, view, controls, sharedServings }: RecipeViewContentProps) {
  switch (view.name) {
    case 'overview':
      return <OverviewView recipe={recipe} controls={controls} sharedServings={sharedServings} />
    case 'prep':
      return <PrepView recipe={recipe} controls={controls} />
    case 'cook':
      return controls.prepDone ? (
        <CookingView recipe={recipe} controls={controls} stepNumber={view.stepNumber} />
      ) : (
        <PrepFirst recipe={recipe} />
      )
    case 'done':
      return <DoneView recipe={recipe} controls={controls} />
  }
}

type DrinkViewProps = { recipe: Drink; controls: RecipeProgressControls; sharedServings: number | null }

function DrinkView({ recipe, controls, sharedServings }: DrinkViewProps) {
  const localized = useLocalized()
  usePageTitle(localized(recipe.title))
  return <DrinkSpread recipe={recipe} controls={controls} sharedServings={sharedServings} />
}

function OverviewView({ recipe, controls, sharedServings }: ViewProps & { sharedServings: number | null }) {
  const localized = useLocalized()
  usePageTitle(localized(recipe.title))
  return <RecipeSpread recipe={recipe} controls={controls} sharedServings={sharedServings} />
}

function PrepView({ recipe, controls }: ViewProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  usePageTitle(`${t('recipe.prepTitle')} · ${localized(recipe.title)}`)
  const startCooking = controls.prepDone ? (
    <BookLink path={recipeViewPath(recipe, { name: 'cook', stepNumber: 1 })} className="button">
      <span className="workspace__action-label">{t('recipe.startCooking')}</span>
      <Icon name="right" />
    </BookLink>
  ) : (
    <button
      type="button"
      className="button"
      aria-disabled="true"
      aria-describedby="prep-locked"
      onClick={() => focusFirstOpenPrepTask(recipe, controls.progress)}
    >
      <span className="workspace__action-label">{t('recipe.startCooking')}</span>
      <Icon name="right" />
    </button>
  )
  return (
    <RecipeWorkspace recipe={recipe} controls={controls} actions={startCooking}>
      <PrepChecklist recipe={recipe} controls={controls} />
    </RecipeWorkspace>
  )
}

function CookingView({ recipe, controls, stepNumber }: ViewProps & { stepNumber: number }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const navigation = useStepNavigation(recipe, stepNumber)
  usePageTitle(`${t('cook.stepOf', { step: stepNumber, total: recipe.cook.length })} · ${localized(recipe.title)}`)
  const stepButtons = (
    <>
      <button type="button" className="button button--quiet" onClick={navigation.goToPrevious}>
        <Icon name="left" />
        <span className="workspace__action-label">{navigation.isFirst ? t('cook.backToPrep') : t('cook.previous')}</span>
      </button>
      <button type="button" className="button" onClick={navigation.goToNext}>
        <span className="workspace__action-label">{navigation.isLast ? t('cook.finish') : t('cook.next')}</span>
        <Icon name={navigation.isLast ? 'check' : 'right'} />
      </button>
    </>
  )
  return (
    <RecipeWorkspace recipe={recipe} controls={controls} actions={stepButtons}>
      <CookStep recipe={recipe} controls={controls} stepNumber={stepNumber} />
    </RecipeWorkspace>
  )
}

/**
 * Shown instead of a cooking step while the prep list has open tasks. Right after Finish (say, the Back button)
 * it says the recipe was finished, rather than blaming missing prep.
 */
function PrepFirst({ recipe }: { recipe: Dish }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { journal } = useRecipeJournal(recipe)
  const finishedToday = wasCookedToday(journal.cookedOn)
  const title = finishedToday ? t('cook.finishedToday') : t('cook.prepNotDone')
  usePageTitle(`${title} · ${localized(recipe.title)}`)
  return (
    <RecipeGate
      recipe={recipe}
      title={title}
      explanation={finishedToday ? t('cook.finishedTodayExplain') : t('cook.prepNotDoneExplain')}
      action={
        <BookLink path={recipeViewPath(recipe, { name: 'prep' })} className="button">
          {t('cook.goToPrep')}
        </BookLink>
      }
    />
  )
}

/** The last page, only after the cook pressed Finish today; otherwise it points back to where they are. */
function DoneView({ recipe, controls }: ViewProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { journal } = useRecipeJournal(recipe)
  const cooked = wasCookedToday(journal.cookedOn)
  usePageTitle(`${cooked ? t('done.title') : t('cook.notFinished')} · ${localized(recipe.title)}`)
  if (cooked) return <Finished recipe={recipe} />
  const nextView: RecipeView = controls.prepDone ? { name: 'cook', stepNumber: 1 } : { name: 'prep' }
  return (
    <RecipeGate
      recipe={recipe}
      title={t('cook.notFinished')}
      explanation={t('cook.notFinishedExplain')}
      action={
        <BookLink path={recipeViewPath(recipe, nextView)} className="button">
          {controls.prepDone ? t('cook.continueCooking') : t('cook.goToPrep')}
        </BookLink>
      }
    />
  )
}
