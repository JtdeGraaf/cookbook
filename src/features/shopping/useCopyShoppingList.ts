import { useTranslation } from 'react-i18next'
import { useCopyText } from '@/components/useCopyText'
import type { ShoppingItem } from '@/lib/shopping-list'
import { useIngredientLine } from '@/features/cooking/useQuantityText'
import { useLocalized } from '@/features/settings/useLanguage'

/** Copies the list as plain lines ("400 g spaghetti", "gin, a bottle"), to paste into a notes app or a chat. */
export function useCopyShoppingList(items: ShoppingItem[]) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const ingredientLine = useIngredientLine()
  const { copy: copyText, outcome } = useCopyText()

  async function copy() {
    const lines = items.map((item) => {
      const line = item.bottle ? t('shopping.bottleLine', { name: localized(item.name) }) : ingredientLine(item, item.quantity)
      return `- ${line}`
    })
    await copyText(lines.join('\n'))
  }

  return { copy, outcome }
}
