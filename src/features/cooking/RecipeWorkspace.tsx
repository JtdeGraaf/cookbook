import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { IngredientBox } from './IngredientBox'
import type { RecipeProgressControls } from './useRecipeProgress'
import './cooking.css'

type RecipeWorkspaceProps = { recipe: Recipe; controls: RecipeProgressControls; children: ReactNode }

/**
 * The cooking layout: the page on the left, ingredients pinned beside it on wide screens.
 * On narrow screens the ingredients open as a sheet from a button that is always on screen.
 */
export function RecipeWorkspace({ recipe, controls, children }: RecipeWorkspaceProps) {
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <div className="workspace">
      <div className="workspace__main">{children}</div>
      <aside className="workspace__side">
        <IngredientBox recipe={recipe} controls={controls} />
      </aside>
      <button type="button" className="ingredients-button" onClick={() => setSheetOpen(true)}>
        <Icon name="list" />
        {t('recipe.showIngredients')}
        <span className="ingredients-button__count numbers">
          {controls.progress.checkedIngredientIds.length}/{recipe.ingredients.length}
        </span>
      </button>
      <IngredientSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
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
      <button type="button" className="icon-button ingredient-sheet__close" onClick={onClose} aria-label={t('recipe.closeIngredients')}>
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}
