import { useTranslation } from 'react-i18next'
import { useCopyText } from '@/components/useCopyText'
import type { Recipe } from '@/lib/book'
import { shareRecipeUrl } from '@/lib/links'
import { useLanguage, useLocalized } from '@/features/settings/useLanguage'

/** Shares a link that opens the recipe scaled for the current servings: the phone's share sheet, or the clipboard. */
export function useShareRecipe(recipe: Recipe, servings: number) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const { language } = useLanguage()
  const { copy, outcome } = useCopyText()

  async function share() {
    const url = shareRecipeUrl(window.location.origin, recipe, servings, language)
    const title = localized(recipe.title)
    if (navigator.share) {
      // Closing the share sheet counts as a rejection; nothing went wrong.
      const textKey = recipe.kind === 'drink' ? 'recipe.shareDrinkText' : 'recipe.shareText'
      await navigator.share({ title, text: t(textKey, { title, count: servings }), url }).catch(() => {})
      return
    }
    await copy(url)
  }

  return { share, outcome }
}
