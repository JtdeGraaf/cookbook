import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useFavourites } from './useFavourites'

export function FavouriteButton({ recipePath }: { recipePath: string }) {
  const { t } = useTranslation()
  const { isFavourite, toggleFavourite } = useFavourites()
  const favourite = isFavourite(recipePath)
  const label = favourite ? t('recipe.unfavourite') : t('recipe.favourite')
  return (
    <button
      type="button"
      className="icon-button favourite-button"
      aria-pressed={favourite}
      aria-label={label}
      title={label}
      onClick={() => toggleFavourite(recipePath)}
    >
      <Icon name={favourite ? 'heartFilled' : 'heart'} />
    </button>
  )
}
