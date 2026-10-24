import type { ReactNode } from 'react'
import type { Recipe } from '@/lib/book'
import { PhaseHead } from './PhaseHead'

type RecipeGateProps = { recipe: Recipe; title: string; explanation: string; action: ReactNode }

/** Stands in for a recipe page you can't use yet, and says where to go instead. */
export function RecipeGate({ recipe, title, explanation, action }: RecipeGateProps) {
  return (
    <section className="gate">
      <PhaseHead recipe={recipe} title={title} />
      <p className="gate__text">{explanation}</p>
      {action}
    </section>
  )
}
