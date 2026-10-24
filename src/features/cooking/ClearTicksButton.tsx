import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { hasTicks } from '@/lib/progress'
import type { RecipeProgressControls } from './useRecipeProgress'

/** Unticks everything for this recipe, after asking. Hidden when there is nothing to clear. */
export function ClearTicksButton({ controls }: { controls: RecipeProgressControls }) {
  const { t } = useTranslation()
  const [asking, setAsking] = useState(false)
  if (!hasTicks(controls.progress)) return null
  return (
    <>
      <button type="button" className="text-button" onClick={() => setAsking(true)}>
        <Icon name="undo" size={18} />
        {t('recipe.clearTicks')}
      </button>
      <ConfirmDialog
        open={asking}
        title={t('recipe.clearTicksQuestion')}
        explanation={t('recipe.clearTicksExplain')}
        confirmLabel={t('recipe.confirmClear')}
        cancelLabel={t('recipe.cancel')}
        onConfirm={() => {
          controls.clearTicks()
          setAsking(false)
        }}
        onCancel={() => setAsking(false)}
      />
    </>
  )
}
