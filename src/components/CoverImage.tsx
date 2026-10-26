import type { Recipe } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { EmptyPlate } from './EmptyPlate'
import { Photo } from './Photo'

type CoverImageProps = {
  recipe: Recipe
  sizes: string
  className?: string
  showCredit?: boolean
  eager?: boolean
}

/** The recipe's photo, or an empty plate on the chapter wash until a photo is added. */
export function CoverImage({ recipe, sizes, className, showCredit = true, eager = false }: CoverImageProps) {
  const localized = useLocalized()
  if (recipe.cover) {
    return <Photo picture={recipe.cover} sizes={sizes} className={className} showCredit={showCredit} eager={eager} />
  }
  return (
    <div className={['cover-placeholder', className].filter(Boolean).join(' ')} data-color={recipe.color} aria-hidden="true">
      <EmptyPlate title={localized(recipe.title)} />
    </div>
  )
}
