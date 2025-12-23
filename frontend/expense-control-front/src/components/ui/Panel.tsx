export function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div className="panel__title">{title}</div>
        <div className="panel__right">{right}</div>
      </div>
      <div className="panel__content">{children}</div>
    </section>
  )
}

