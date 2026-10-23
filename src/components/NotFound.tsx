import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <section className="not-found">
      <h1 className="not-found__title">{t('notFound.title')}</h1>
      <p className="not-found__body">{t('notFound.body')}</p>
      <Link to="/" className="button">
        {t('book.backToContents')}
      </Link>
    </section>
  )
}
