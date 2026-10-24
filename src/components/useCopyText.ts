import { useEffect, useRef, useState } from 'react'

/** What the last copy did. A failed copy keeps its text, so the page can offer it to copy by hand. */
export type CopyOutcome = { status: 'idle' } | { status: 'copied' } | { status: 'failed'; text: string }

const SHOW_COPIED_MS = 2500

/**
 * Copies text to the clipboard and says how it went. Browsers can refuse (no permission, page not focused, no
 * clipboard at all on plain http), so a refusal becomes a `failed` outcome instead of an error.
 */
export function useCopyText() {
  const [outcome, setOutcome] = useState<CopyOutcome>({ status: 'idle' })
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  async function copy(text: string) {
    window.clearTimeout(resetTimer.current)
    const copied = await writeToClipboard(text)
    if (!copied) {
      setOutcome({ status: 'failed', text })
      return
    }
    setOutcome({ status: 'copied' })
    resetTimer.current = window.setTimeout(() => setOutcome({ status: 'idle' }), SHOW_COPIED_MS)
  }

  return { copy, outcome }
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
