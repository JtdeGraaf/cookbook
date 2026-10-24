import type { Ingredient, Quantity } from './book'
import type { Language, Unit } from './recipe-rules'

/** An ingredient's amount for the chosen servings; null for "to taste". */
export function scaleIngredient(ingredient: Ingredient, factor: number): Quantity | null {
  return ingredient.quantity ? scaleQuantity(ingredient.quantity, factor) : null
}

/** Units counted in whole things, shown with kitchen fractions like ½ instead of decimals. */
const COUNTED_UNITS: readonly Unit[] = ['piece', 'clove', 'slice', 'sprig', 'can']
const SPOON_UNITS: readonly Unit[] = ['tsp', 'tbsp']
const TEASPOONS_PER_TABLESPOON = 3

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' }

/** Scales an amount from the recipe's servings to the cook's, then rounds it to something you can measure. */
export function scaleQuantity(quantity: Quantity, factor: number): Quantity {
  const amount = quantity.amount * factor
  switch (quantity.unit) {
    case 'g':
    case 'kg':
      return roundMetric(quantity.unit === 'kg' ? amount * 1000 : amount, 'g', 'kg')
    case 'ml':
    case 'l':
      return roundMetric(quantity.unit === 'l' ? amount * 1000 : amount, 'ml', 'l')
    case 'tsp':
    case 'tbsp':
      return roundSpoons(quantity.unit === 'tbsp' ? amount * TEASPOONS_PER_TABLESPOON : amount)
    case 'pinch':
      return { amount: Math.max(1, Math.round(amount)), unit: 'pinch' }
    case 'piece':
    case 'clove':
    case 'slice':
    case 'sprig':
    case 'can':
      return { amount: Math.max(0.5, roundToStep(amount, 0.5)), unit: quantity.unit }
  }
}

/** Grams or millilitres; switches to kilos or litres from 1000 up. */
function roundMetric(smallAmount: number, smallUnit: Unit, largeUnit: Unit): Quantity {
  if (smallAmount >= 1000) return { amount: roundToStep(smallAmount / 1000, 0.1), unit: largeUnit }
  if (smallAmount >= 100) return { amount: roundToStep(smallAmount, 5), unit: smallUnit }
  if (smallAmount >= 10) return { amount: Math.round(smallAmount), unit: smallUnit }
  return { amount: Math.max(0.5, roundToStep(smallAmount, 0.5)), unit: smallUnit }
}

/** Teaspoons below one tablespoon, tablespoons from there. */
function roundSpoons(teaspoons: number): Quantity {
  if (teaspoons >= TEASPOONS_PER_TABLESPOON) {
    return { amount: roundToStep(teaspoons / TEASPOONS_PER_TABLESPOON, 0.5), unit: 'tbsp' }
  }
  return { amount: Math.max(0.25, roundToStep(teaspoons, 0.25)), unit: 'tsp' }
}

function roundToStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(4))
}

/** "1½" for counted things and spoons, "1,5" or "1.5" for metric amounts, following the language. */
export function formatAmount(quantity: Quantity, language: Language): string {
  const usesFractions = COUNTED_UNITS.includes(quantity.unit) || SPOON_UNITS.includes(quantity.unit)
  if (!usesFractions) return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(quantity.amount)

  const whole = Math.floor(quantity.amount)
  const fraction = FRACTIONS[String(Number((quantity.amount - whole).toFixed(2)))]
  if (!fraction) return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(quantity.amount)
  return whole === 0 ? fraction : `${whole}${fraction}`
}

/** The number a unit label is pluralised by: "½ clove", "1 clove", "2 cloves". */
export function pluralCount(quantity: Quantity): number {
  return quantity.amount <= 1 ? 1 : quantity.amount
}

export function servingsFactor(recipeServings: number, chosenServings: number): number {
  return chosenServings / recipeServings
}
