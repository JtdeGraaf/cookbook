import { describe, expect, it } from 'vitest'
import { joinLink, phraseInLink, qrCodeFor } from './qr-code'

describe('the code another phone scans', () => {
  it('draws one square per dark module of the QR code', () => {
    const code = qrCodeFor('https://kookboek.graaf.dev/sync#join=tomaat-oven-paars-lepel')

    expect(code.size).toBeGreaterThanOrEqual(21)
    // The three finder squares in the corners always start with a dark module.
    expect(code.path.startsWith('M0 0h1v1h-1z')).toBe(true)
  })

  it('links to the sync page with the words after #, and reads them back', () => {
    const link = joinLink('https://kookboek.graaf.dev', 'tomaat-oven-paars-lepel')

    expect(link).toBe('https://kookboek.graaf.dev/sync#join=tomaat-oven-paars-lepel')
    expect(phraseInLink(new URL(link).hash)).toBe('tomaat-oven-paars-lepel')
    expect(phraseInLink('join=tomaat-oven-paars-lepel')).toBe('tomaat-oven-paars-lepel')
    expect(phraseInLink('')).toBeNull()
  })
})
