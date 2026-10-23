import { useTranslation } from 'react-i18next'

/** The page number and running chapter title at the foot of a page. */
export function Folio({ page, label }: { page: number | null; label: string }) {
  const { t } = useTranslation()
  return (
    <footer className="folio">
      {page !== null && (
        <span className="folio__number" aria-label={t('book.pageLabel', { page })}>
          {page}
        </span>
      )}
      <span>{label}</span>
    </footer>
  )
}
