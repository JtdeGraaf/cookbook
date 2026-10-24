import { useTranslation } from 'react-i18next'

/** Shown instead of a listing when the filters leave nothing. The filter bar right above offers to clear them. */
export function NoMatches() {
  const { t } = useTranslation()
  return (
    <div className="contents__empty">
      <p>{t('filters.noMatches')}</p>
    </div>
  )
}
