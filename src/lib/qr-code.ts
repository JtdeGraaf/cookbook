import { encode } from 'uqr'

/** A QR code as one SVG path of dark squares, `size` squares wide, without the quiet border around it. */
export type QrCode = { size: number; path: string }

export function qrCodeFor(text: string): QrCode {
  const { data, size } = encode(text, { ecc: 'M', border: 0 })
  const squares = data.flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])))
  return { size, path: squares.join('') }
}

/** The link another phone opens by scanning the code: the sync page, with the words after # so no server sees them. */
export function joinLink(origin: string, phrase: string): string {
  return `${origin}/sync#join=${phrase}`
}

/** The words in a join link's `#join=…`, or null when the link has none. */
export function phraseInLink(hash: string): string | null {
  const match = /(?:^|[#&])join=([a-z-]+)/.exec(hash)
  return match ? match[1] : null
}
