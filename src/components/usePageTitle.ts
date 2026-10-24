import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setPageTitle } from './page-title'

/** Names the page in the browser tab and history, like "Shakshuka · Cookbook". */
export function usePageTitle(title: string | null) {
  const { t } = useTranslation()
  const bookTitle = t('book.title')
  useEffect(() => {
    setPageTitle(title ? `${title} · ${bookTitle}` : bookTitle)
  }, [title, bookTitle])
}
