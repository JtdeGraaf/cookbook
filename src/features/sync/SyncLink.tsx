import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'

/** The way to sharing the book between phones, in the header. */
export function SyncLink() {
  const { t } = useTranslation()
  return (
    <Link to="/sync" className="icon-button" aria-label={t('header.sync')} title={t('header.sync')}>
      <Icon name="sync" />
    </Link>
  )
}
