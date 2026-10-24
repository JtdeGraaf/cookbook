/** Line icons drawn for this book: 24px grid, 2px round stroke, so they match the rounded type. */
const PATHS = {
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  timer:
    'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2.5 2M10 2h4M12 2v3M19.5 5.5l-1.5 1.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  left: 'M14.5 5l-7 7 7 7',
  right: 'M9.5 5l7 7-7 7',
  down: 'M5 9.5l7 7 7-7',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  bell: 'M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15l1.5-2ZM10 21h4',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  undo: 'M4.5 9.5h10a5 5 0 0 1 0 10H9M8.5 5.5l-4 4 4 4',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z',
  basket: 'M3.5 9.5h17l-1.8 9a2 2 0 0 1-2 1.5H7.3a2 2 0 0 1-2-1.5l-1.8-9ZM8 9.5l3-5.5M16 9.5l-3-5.5M9.5 13v3.5M14.5 13v3.5',
  folder: 'M3.5 6.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.5Z',
  recipe: 'M6.5 3.5h8l3.5 3.5v13.5h-11.5V3.5ZM14.5 3.5V7H18M9.5 11.5h5M9.5 15h5',
  external: 'M13.5 4.5h6v6M19.5 4.5 11 13M17.5 14v4.5a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2H10',
  share: 'M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  print: 'M7 8.5V3.5h10v5M7 17.5H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6.5H7V14Z',
  shuffle: 'M3.5 7h3.5c4.5 0 5.5 10 10 10h3.5M3.5 17h3.5c1.4 0 2.4-.9 3.2-2.2M13.8 9.2c.8-1.3 1.8-2.2 3.2-2.2h3.5M18 4.5 20.5 7 18 9.5M18 14.5l2.5 2.5-2.5 2.5',
  screen: 'M7.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 1.5-1.5ZM11 18.5h2',
} as const

/** Icons that are filled instead of outlined, to show an "on" state. */
const FILLED: Partial<Record<IconName | 'heartFilled', IconName>> = { heartFilled: 'heart' }

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 22 }: { name: IconName | 'heartFilled'; size?: number }) {
  const filledFrom = FILLED[name]
  const path = filledFrom ? PATHS[filledFrom] : PATHS[name as IconName]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filledFrom ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}
