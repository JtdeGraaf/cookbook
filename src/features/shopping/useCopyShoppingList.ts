import { useState } from 'react'
import type { ShoppingItem } from '@/lib/shopping-list'
import { useQuantityLabel } from '@/features/cooking/useQuantityText'
import { useLocalized } from '@/features/settings/useLanguage'

/** Copies the list as plain lines ("400 g spaghetti"), to paste into a notes app or a chat. */
export function useCopyShoppingList(items: ShoppingItem[]) {
  const localized = useLocalized()
  const quantityLabel = useQuantityLabel()
  const [copied, setCopied] = useState(false)

  async function copy() {
    const lines = items.map((item) => `- ${quantityLabel(item.quantity)} ${localized(item.name)}`)
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return { copy, copied }
}
