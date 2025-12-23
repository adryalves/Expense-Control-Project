import { getInitials } from '../lib/format'

export function PlaceholderPage({ title }: { title: string }) {
  const userName = 'Admin Demo'
  return (
    <div className="placeholder">
      <div className="placeholder__title">{title}</div>
      <div className="placeholder__subtitle">Em breve</div>
      <div className="placeholder__card">
        <div className="placeholder__avatar">{getInitials(userName)}</div>
        <div className="placeholder__text">Esta tela será implementada nas próximas etapas.</div>
      </div>
    </div>
  )
}

