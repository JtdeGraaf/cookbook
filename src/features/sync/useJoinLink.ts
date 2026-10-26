import { useLocation, useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { joinLink, phraseInLink, qrCodeFor } from '@/lib/qr-code'

/** The words in a scanned link (`/sync#join=…`), and a way to put the link away once answered. */
export function useJoinLink() {
  const hash = useLocation({ select: (location) => location.hash })
  const navigate = useNavigate()
  const dismiss = useCallback(() => void navigate({ to: '/sync', hash: '', replace: true }), [navigate])
  return { linkedPhrase: phraseInLink(hash), dismiss }
}

/** The QR code that opens this book's sync page with `phrase` on another phone. */
export function useJoinCode(phrase: string) {
  return useMemo(() => qrCodeFor(joinLink(window.location.origin, phrase)), [phrase])
}
