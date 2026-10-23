import { describe, expect, it } from 'vitest'
import { formatAmount, pluralCount, scaleQuantity } from './quantity'

describe('scaleQuantity', () => {
  it('keeps the amount when the factor is one', () => {
    expect(scaleQuantity({ amount: 250, unit: 'g' }, 1)).toEqual({ amount: 250, unit: 'g' })
  })

  it('rounds larger gram amounts to the nearest 5', () => {
    expect(scaleQuantity({ amount: 250, unit: 'g' }, 0.75)).toEqual({ amount: 190, unit: 'g' })
  })

  it('rounds medium gram amounts to whole grams', () => {
    expect(scaleQuantity({ amount: 50, unit: 'g' }, 2 / 3)).toEqual({ amount: 33, unit: 'g' })
  })

  it('switches grams to kilos from 1000 g', () => {
    expect(scaleQuantity({ amount: 600, unit: 'g' }, 2)).toEqual({ amount: 1.2, unit: 'kg' })
  })

  it('switches kilos back to grams below 1 kg', () => {
    expect(scaleQuantity({ amount: 1.5, unit: 'kg' }, 0.5)).toEqual({ amount: 750, unit: 'g' })
  })

  it('switches millilitres to litres and back', () => {
    expect(scaleQuantity({ amount: 500, unit: 'ml' }, 3)).toEqual({ amount: 1.5, unit: 'l' })
    expect(scaleQuantity({ amount: 2, unit: 'l' }, 0.25)).toEqual({ amount: 500, unit: 'ml' })
  })

  it('turns three or more teaspoons into tablespoons', () => {
    expect(scaleQuantity({ amount: 1, unit: 'tsp' }, 3)).toEqual({ amount: 1, unit: 'tbsp' })
  })

  it('turns less than a tablespoon into teaspoons', () => {
    expect(scaleQuantity({ amount: 1, unit: 'tbsp' }, 0.5)).toEqual({ amount: 1.5, unit: 'tsp' })
  })

  it('never goes below a quarter teaspoon', () => {
    expect(scaleQuantity({ amount: 0.5, unit: 'tsp' }, 0.25)).toEqual({ amount: 0.25, unit: 'tsp' })
  })

  it('rounds counted things to halves', () => {
    expect(scaleQuantity({ amount: 4, unit: 'piece' }, 1.5)).toEqual({ amount: 6, unit: 'piece' })
    expect(scaleQuantity({ amount: 3, unit: 'clove' }, 0.5)).toEqual({ amount: 1.5, unit: 'clove' })
  })

  it('keeps at least half of a counted thing', () => {
    expect(scaleQuantity({ amount: 1, unit: 'piece' }, 0.25)).toEqual({ amount: 0.5, unit: 'piece' })
  })

  it('keeps pinches whole and at least one', () => {
    expect(scaleQuantity({ amount: 1, unit: 'pinch' }, 0.5)).toEqual({ amount: 1, unit: 'pinch' })
    expect(scaleQuantity({ amount: 1, unit: 'pinch' }, 3)).toEqual({ amount: 3, unit: 'pinch' })
  })
})

describe('formatAmount', () => {
  it('writes kitchen fractions for counted things', () => {
    expect(formatAmount({ amount: 1.5, unit: 'clove' }, 'en')).toBe('1½')
    expect(formatAmount({ amount: 0.5, unit: 'piece' }, 'nl')).toBe('½')
    expect(formatAmount({ amount: 2.75, unit: 'tsp' }, 'en')).toBe('2¾')
  })

  it('writes decimals for metric amounts in the language of the reader', () => {
    expect(formatAmount({ amount: 1.5, unit: 'kg' }, 'en')).toBe('1.5')
    expect(formatAmount({ amount: 1.5, unit: 'kg' }, 'nl')).toBe('1,5')
  })
})

describe('pluralCount', () => {
  it('treats one or less as singular', () => {
    expect(pluralCount({ amount: 0.5, unit: 'clove' })).toBe(1)
    expect(pluralCount({ amount: 3, unit: 'clove' })).toBe(3)
  })
})
