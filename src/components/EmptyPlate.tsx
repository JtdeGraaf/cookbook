import './empty-plate.css'

/** An empty plate with the recipe's first letter on it, standing in for a photo that hasn't been taken yet. */
export function EmptyPlate({ title }: { title: string }) {
  return (
    <span className="empty-plate" aria-hidden="true">
      <span className="empty-plate__letter">{title.charAt(0)}</span>
    </span>
  )
}
