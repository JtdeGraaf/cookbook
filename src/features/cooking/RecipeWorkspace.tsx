import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { useTimers } from '@/features/timers/useTimers'
import { IngredientBox } from './IngredientBox'
import { canKeepScreenOn } from './useWakeLock'
import type { RecipeProgressControls } from './useRecipeProgress'
import './cooking.css'

type RecipeWorkspaceProps = {
  recipe: Recipe
  controls: RecipeProgressControls
  /** The buttons that move the cook on, like Previous and Next. */
  actions: ReactNode
  children: ReactNode
}

/**
 * The prep and cooking layout. Wide screens: the page with the ingredients pinned beside it. Phones: one dock at the
 * bottom with the ingredients and the buttons that move on, so they are always in reach and never overlap.
 */
export function RecipeWorkspace({ recipe, controls, actions, children }: RecipeWorkspaceProps) {
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const timerRinging = useTimers().some((timer) => timer.state.kind === 'finished')
  // The sheet covers the timer shelf, so it gets out of the way while a timer rings.
  const sheetShown = sheetOpen && !timerRinging

  return (
    <div className="workspace">
      <div className="workspace__main">
        {children}
        {canKeepScreenOn() && (
          <p className="workspace__screen-note">
            <Icon name="screen" size={18} />
            {t('recipe.screenOn')}
          </p>
        )}
        <div className="workspace__dock">
          <button
            type="button"
            className="ingredients-button"
            onClick={() => setSheetOpen(true)}
            disabled={timerRinging}
          >
            <Icon name="list" />
            <span className="ingredients-button__label">{t('recipe.showIngredients')}</span>
            <span className="ingredients-button__count numbers">
              {controls.progress.haveIngredientIds.length}/{recipe.ingredients.length}
            </span>
          </button>
          <div className="workspace__actions">{actions}</div>
        </div>
      </div>
      <aside className="workspace__side">
        <IngredientBox recipe={recipe} controls={controls} />
      </aside>
      <IngredientSheet open={sheetShown} onClose={() => setSheetOpen(false)}>
        <IngredientBox recipe={recipe} controls={controls} />
      </IngredientSheet>
    </div>
  )
}

function IngredientSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="ingredient-sheet"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
    >
      <button
        type="button"
        className="icon-button ingredient-sheet__close"
        onClick={onClose}
        aria-label={t('recipe.closeIngredients')}
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}
