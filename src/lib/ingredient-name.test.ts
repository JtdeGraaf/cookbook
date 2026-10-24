import { describe, expect, it } from 'vitest'
import { both } from '@/test/fixtures'
import { nameForAmount } from './ingredient-name'

const egg = { name: both('egg', 'ei'), plural: both('eggs', 'eieren') }

describe('nameForAmount', () => {
  it('uses the plural name for more than one', () => {
    expect(nameForAmount(egg, { amount: 3.5, unit: 'piece' })).toEqual(both('eggs', 'eieren'))
    expect(nameForAmount(egg, { amount: 2, unit: 'piece' })).toEqual(both('eggs', 'eieren'))
  })

  it('keeps the plain name for one or less', () => {
    expect(nameForAmount(egg, { amount: 1, unit: 'piece' })).toEqual(both('egg', 'ei'))
    expect(nameForAmount(egg, { amount: 0.5, unit: 'piece' })).toEqual(both('egg', 'ei'))
  })

  it('keeps the plain name for "to taste"', () => {
    expect(nameForAmount(egg, null)).toEqual(both('egg', 'ei'))
  })

  it('keeps the name when there is no plural', () => {
    expect(nameForAmount({ name: both('garlic', 'knoflook'), plural: null }, { amount: 4, unit: 'clove' })).toEqual(
      both('garlic', 'knoflook'),
    )
  })
})
