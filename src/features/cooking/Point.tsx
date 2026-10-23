import { useTranslation } from 'react-i18next'
import type { LocalizedText } from '@/lib/recipe-rules'
import { useLocalized } from '@/features/settings/useLanguage'

/** A "Point" note: the small hint box Japanese home-cooking books print next to a step. */
export function Point({ tip }: { tip: LocalizedText }) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <aside className="point">
      <span className="point__label">{t('recipe.point')}</span>
      <p className="point__text">{localized(tip)}</p>
    </aside>
  )
}
