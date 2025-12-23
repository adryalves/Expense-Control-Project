export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="emptyState">
      <div className="emptyState__title">{title}</div>
      <div className="emptyState__description">{description}</div>
    </div>
  )
}

