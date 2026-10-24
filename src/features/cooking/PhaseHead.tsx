import type { ReactNode } from 'react'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import type { Recipe } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'

type PhaseHeadProps = { recipe: Recipe; title: string; children?: ReactNode }

/** The head of every page inside a recipe: the way back to the recipe, then what this page is. */
export function PhaseHead({ recipe, title, children }: PhaseHeadProps) {
  const localized = useLocalized()
  return (
    <header className="phase-head">
      <BookLink path={recipe.path} className="phase-head__back">
        <Icon name="left" size={18} />
        {localized(recipe.title)}
      </BookLink>
      <h1 className="phase-head__title">{title}</h1>
      {children}
    </header>
  )
}
