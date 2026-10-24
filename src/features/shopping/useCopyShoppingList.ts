import { useCopyText } from '@/components/useCopyText'
import type { ShoppingItem } from '@/lib/shopping-list'
import { useIngredientLine } from '@/features/cooking/useQuantityText'

/** Copies the list as plain lines ("400 g spaghetti"), to paste into a notes app or a chat. */
export function useCopyShoppingList(items: ShoppingItem[]) {
  const ingredientLine = useIngredientLine()
  const { copy: copyText, outcome } = useCopyText()

  async function copy() {
    const lines = items.map((item) => `- ${ingredientLine(item, item.quantity)}`)
    await copyText(lines.join('\n'))
  }

  return { copy, outcome }
}
