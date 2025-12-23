import { Icon } from '../Icon'

export function Topbar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__actions">
        <button className="topbar__iconButton" type="button" aria-label="Notificações">
          <Icon name="bell" className="icon" />
        </button>
        <div className="topbar__avatar" aria-label="Usuário">
          AD
        </div>
      </div>
    </header>
  )
}
