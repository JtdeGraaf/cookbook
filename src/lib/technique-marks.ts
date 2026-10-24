/**
 * Cooking terms in step text are marked like "[[chop it finely|chop-finely]]": the words to show, then the id of
 * the technique in recipes/techniques.json that explains them.
 */

export type MarkedPiece = { kind: 'words'; text: string } | { kind: 'technique'; text: string; techniqueId: string }

const MARK = /\[\[([^[\]|]+)\|([a-z0-9]+(?:-[a-z0-9]+)*)\]\]/g

/** Splits step text into plain words and marked terms. Null when a mark is broken, like "[[chop" or "[[chop]]". */
export function splitTechniqueMarks(text: string): MarkedPiece[] | null {
  const pieces: MarkedPiece[] = []
  let wordsStart = 0
  for (const match of text.matchAll(MARK)) {
    addWords(pieces, text.slice(wordsStart, match.index))
    pieces.push({ kind: 'technique', text: match[1], techniqueId: match[2] })
    wordsStart = match.index + match[0].length
  }
  addWords(pieces, text.slice(wordsStart))
  const brokenMark = pieces.some((piece) => piece.kind === 'words' && /\[\[|\]\]/.test(piece.text))
  return brokenMark ? null : pieces
}

/** The text as a reader sees it, without the marks. */
export function plainText(pieces: readonly { text: string }[]): string {
  return pieces.map((piece) => piece.text).join('')
}

/** The technique ids a text points at, each once, in order. */
export function techniqueIds(pieces: MarkedPiece[]): string[] {
  const ids = pieces.flatMap((piece) => (piece.kind === 'technique' ? [piece.techniqueId] : []))
  return [...new Set(ids)]
}

/** "chop it finely" becomes ["chop it ", "finely"], so the last word can stay on one line with its (i) button. */
export function splitBeforeLastWord(text: string): [string, string] {
  const lastSpace = text.lastIndexOf(' ')
  return [text.slice(0, lastSpace + 1), text.slice(lastSpace + 1)]
}

function addWords(pieces: MarkedPiece[], text: string) {
  if (text) pieces.push({ kind: 'words', text })
}
