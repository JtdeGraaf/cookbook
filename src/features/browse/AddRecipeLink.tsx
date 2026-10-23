import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { newRecipeUrl } from '@/lib/links'

/** Opens GitHub's new-file page in this folder with a ready-to-fill recipe.json. */
export function AddRecipeLink({ folderPath }: { folderPath: string }) {
  const { t } = useTranslation()
  return (
    <p className="add-recipe">
      <a className="add-recipe__link" href={newRecipeUrl(folderPath)} target="_blank" rel="noreferrer">
        <Icon name="plus" size={20} />
        {t('browse.addRecipe')}
      </a>
      <span className="add-recipe__hint">{t('browse.addRecipeHint')}</span>
    </p>
  )
}
