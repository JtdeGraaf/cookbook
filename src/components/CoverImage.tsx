import type { Recipe } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import { Photo } from './Photo'

type CoverImageProps = {
  recipe: Recipe
  sizes: string
  className?: string
  showCredit?: boolean
  eager?: boolean
}

/** The recipe's photo, or a block of chapter colour with its first letter until a photo is added. */
export function CoverImage({ recipe, sizes, className, showCredit = true, eager = false }: CoverImageProps) {
  const localized = useLocalized()
  if (recipe.cover) {
    return <Photo picture={recipe.cover} sizes={sizes} className={className} showCredit={showCredit} eager={eager} />
  }
  return (
    <div className={['cover-placeholder', className].filter(Boolean).join(' ')} data-color={recipe.color} aria-hidden="true">
      <span className="cover-placeholder__letter">{localized(recipe.title).charAt(0)}</span>
    </div>
  )
}
