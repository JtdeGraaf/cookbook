import { useTranslation } from 'react-i18next'
import type { Picture } from '@/lib/book'
import { useLocalized } from '@/features/settings/useLanguage'
import './photo.css'

type PhotoProps = {
  picture: Picture
  /** How wide the photo shows on screen, so the browser picks the right file. */
  sizes: string
  className?: string
  showCredit?: boolean
  eager?: boolean
}

export function Photo({ picture, sizes, className, showCredit = true, eager = false }: PhotoProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  return (
    <figure className={['photo', className].filter(Boolean).join(' ')}>
      <img
        className="photo__image"
        src={picture.file.src}
        srcSet={picture.file.srcset}
        sizes={sizes}
        width={picture.file.w}
        height={picture.file.h}
        alt={localized(picture.alt)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {showCredit && picture.credit && (
        <figcaption className="photo__credit">
          <a href={picture.credit.source} target="_blank" rel="noreferrer">
            {t('recipe.photoCredit', { author: picture.credit.author, license: picture.credit.license })}
          </a>
        </figcaption>
      )}
    </figure>
  )
}
