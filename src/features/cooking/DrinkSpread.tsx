import { useTranslation } from 'react-i18next'
import { CoverImage } from '@/components/CoverImage'
import { Folio } from '@/components/Folio'
import { Icon } from '@/components/Icon'
import { folderTrail, type Drink } from '@/lib/book'
import { book, pageOf } from '@/features/book/book-data'
import { PathBar } from '@/features/browse/PathBar'
import { useLocalized } from '@/features/settings/useLanguage'
import { ClearTicksButton } from './ClearTicksButton'
import { finishDrink, wasCookedToday } from './finish-cooking'
import { IngredientBox } from './IngredientBox'
import { MethodSteps } from './MethodSteps'
import { SpreadHead } from './SpreadHead'
import { useRecipeJournal } from './useRecipeJournal'
import type { RecipeProgressControls } from './useRecipeProgress'
import './cooking.css'

type DrinkSpreadProps = {
  recipe: Drink
  controls: RecipeProgressControls
  /** Servings this visit opened with from a shared link, to say why the numbers changed. */
  sharedServings: number | null
}

/**
 * A drink on one spread: glass, ice and mix up top, the spec beside the photo and the steps on the right. Unlike a
 * dish there is no prep list or step-by-step mode; a drink takes a minute, so it is read from here.
 */
export function DrinkSpread({ recipe, controls, sharedServings }: DrinkSpreadProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const folder = folderTrail(book, recipe.folderPath).at(-1)

  return (
    <>
      <PathBar folderPath={recipe.folderPath} currentTitle={localized(recipe.title)} />
      <article className="spread spread--drink">
        <SpreadHead
          recipe={recipe}
          servings={controls.servings}
          sharedServings={sharedServings}
          facts={
            <>
              <div>
                <dt>{t('drink.method')}</dt>
                <dd>{t(`drink.methods.${recipe.method}`)}</dd>
              </div>
              <div>
                <dt>{t('drink.glass')}</dt>
                <dd>{t(`drink.glasses.${recipe.glass}`)}</dd>
              </div>
              <div>
                <dt>{t('drink.ice')}</dt>
                <dd>{t(`drink.iceKinds.${recipe.ice}`)}</dd>
              </div>
            </>
          }
        />

        <div className="spread__page spread__page--left">
          <CoverImage recipe={recipe} sizes="(min-width: 1024px) 520px, 100vw" className="spread__photo" eager />
          <IngredientBox recipe={recipe} controls={controls} />
        </div>

        <div className="spread__page spread__page--right">
          <MethodSteps steps={recipe.steps} />
          <div className="spread__actions">
            <button type="button" className="button" onClick={() => finishDrink(recipe)}>
              <Icon name="check" />
              {t('drink.madeIt')}
            </button>
            <ClearTicksButton recipe={recipe} controls={controls} />
            <MadeTodayNote recipe={recipe} />
          </div>
        </div>

        <Folio page={pageOf(recipe.path)} label={folder ? localized(folder.title) : ''} />
      </article>
    </>
  )
}

/** Says the drink was made today, once Made it is pressed, and whether that took it off the shopping list. */
function MadeTodayNote({ recipe }: { recipe: Drink }) {
  const { t } = useTranslation()
  const { journal } = useRecipeJournal(recipe)
  if (!wasCookedToday(journal.cookedOn)) return null
  return (
    <p className="drink-made" role="status">
      <strong className="drink-made__title">
        {journal.takenOffShoppingList ? t('drink.madeTodayOffList') : t('drink.madeToday')}
      </strong>{' '}
      {t('drink.clearedTicks')}
    </p>
  )
}
