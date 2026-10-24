// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { EMPTY_PROGRESS } from '@/lib/progress'
import { makeRecipe, makeStep } from '@/test/fixtures'
import { focusFirstOpenPrepTask, prepTaskTickId } from './prep-task-focus'

const recipe = makeRecipe({ slug: 'soup', prep: [makeStep(), makeStep(), makeStep()] })

function renderTickBoxes() {
  document.body.innerHTML = recipe.prep
    .map((_step, index) => `<input type="checkbox" id="${prepTaskTickId(index)}" />`)
    .join('')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('focusFirstOpenPrepTask', () => {
  it('moves focus to the first prep task that is not ticked off', () => {
    renderTickBoxes()

    focusFirstOpenPrepTask(recipe, { ...EMPTY_PROGRESS, donePrepSteps: [0] })

    expect(document.activeElement?.id).toBe('prep-task-2')
  })

  it('leaves focus alone once every prep task is done', () => {
    renderTickBoxes()

    focusFirstOpenPrepTask(recipe, { ...EMPTY_PROGRESS, donePrepSteps: [0, 1, 2] })

    expect(document.activeElement).toBe(document.body)
  })
})
