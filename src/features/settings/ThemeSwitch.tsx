import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useTheme } from './useTheme'

export function ThemeSwitch() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? t('header.switchToLight') : t('header.switchToDark')
  return (
    <button type="button" className="icon-button" onClick={toggleTheme} aria-label={label} title={label}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
