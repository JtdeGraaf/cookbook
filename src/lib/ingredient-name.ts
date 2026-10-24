import type { Quantity } from './book'
import { pluralCount } from './quantity'
import type { LocalizedText } from './recipe-rules'

/** An ingredient's name, and its name for more than one when that is different. */
export type IngredientNames = { name: LocalizedText; plural: LocalizedText | null }

/** "eggs" for more than one, "egg" for one, a half, or "to taste"; the same rule that pluralises units. */
export function nameForAmount(names: IngredientNames, quantity: Quantity | null): LocalizedText {
  if (!names.plural || !quantity) return names.name
  return pluralCount(quantity) > 1 ? names.plural : names.name
}
