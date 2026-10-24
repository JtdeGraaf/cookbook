import { describe, expect, it } from 'vitest'
import { plainText, splitBeforeLastWord, splitTechniqueMarks, techniqueIds } from './technique-marks'

describe('splitTechniqueMarks', () => {
  it('splits marked terms from the words around them', () => {
    expect(splitTechniqueMarks('Peel the onion and [[chop it finely|chop-finely]].')).toEqual([
      { kind: 'words', text: 'Peel the onion and ' },
      { kind: 'technique', text: 'chop it finely', techniqueId: 'chop-finely' },
      { kind: 'words', text: '.' },
    ])
  })

  it('reads several marks, including one at the very start', () => {
    expect(splitTechniqueMarks('[[Whisk|whisk]] the eggs, then [[simmer|simmer]]')).toEqual([
      { kind: 'technique', text: 'Whisk', techniqueId: 'whisk' },
      { kind: 'words', text: ' the eggs, then ' },
      { kind: 'technique', text: 'simmer', techniqueId: 'simmer' },
    ])
  })

  it('leaves text without marks as one piece', () => {
    expect(splitTechniqueMarks('Heat the oven to 200 °C.')).toEqual([{ kind: 'words', text: 'Heat the oven to 200 °C.' }])
  })

  it.each([
    ['no id', 'Chop it [[finely]].'],
    ['no closing brackets', 'Chop it [[finely|chop-finely.'],
    ['an id that is not a slug', 'Chop it [[finely|Chop Finely]].'],
    ['no words', 'Chop it [[|chop-finely]].'],
    ['stray closing brackets', 'Chop it finely]].'],
  ])('refuses a broken mark: %s', (_case, text) => {
    expect(splitTechniqueMarks(text)).toBeNull()
  })
})

describe('plainText', () => {
  it('shows the marked words without the marks', () => {
    const pieces = splitTechniqueMarks('Pel de ui en [[snijd hem fijn|chop-finely]].') ?? []

    expect(plainText(pieces)).toBe('Pel de ui en snijd hem fijn.')
  })
})

describe('techniqueIds', () => {
  it('lists each technique once, in order', () => {
    const pieces = splitTechniqueMarks('[[Chop|chop-finely]] the onion, [[whisk|whisk]], [[chop|chop-finely]] the garlic.') ?? []

    expect(techniqueIds(pieces)).toEqual(['chop-finely', 'whisk'])
  })
})

describe('splitBeforeLastWord', () => {
  it('splits off the last word', () => {
    expect(splitBeforeLastWord('chop it finely')).toEqual(['chop it ', 'finely'])
  })

  it('keeps a single word whole', () => {
    expect(splitBeforeLastWord('Whisk')).toEqual(['', 'Whisk'])
  })
})
