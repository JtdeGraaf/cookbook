import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useFavourites } from './useFavourites'

/** A labelled toggle; its state is in aria-pressed and the filled heart, so the label never has to change. */
export function FavouriteButton({ recipePath }: { recipePath: string }) {
  const { t } = useTranslation()
  const { isFavourite, toggleFavourite } = useFavourites()
  const favourite = isFavourite(recipePath)
  return (
    <button
      type="button"
      className="recipe-actions__button favourite-button"
      aria-pressed={favourite}
      onClick={() => toggleFavourite(recipePath)}
    >
      <Icon name={favourite ? 'heartFilled' : 'heart'} size={20} />
      {t('recipe.favourite')}
    </button>
  )
}
