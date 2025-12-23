import { Icon } from '../Icon'
import { navigate, type RouteKey } from '../../lib/router'

export function Sidebar({ activeRoute }: { activeRoute: RouteKey }) {
  const navItems: Array<{ label: string; route: RouteKey; icon: Parameters<typeof Icon>[0]['name'] }> = [
    { label: 'Dashboard', route: 'dashboard', icon: 'home' },
    { label: 'Pessoas', route: 'people', icon: 'users' },
    { label: 'Categorias', route: 'categories', icon: 'tag' },
    { label: 'Transações', route: 'transactions', icon: 'arrows' },
  ]

  const reportItems: Array<{ label: string; route: RouteKey }> = [
    { label: 'Totais por Pessoa', route: 'report-person' },
    { label: 'Totais por Categoria', route: 'report-category' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brandTitle">Gastos residenciais</div>
        <div className="sidebar__brandSubtitle">Gestão de Controle</div>
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {navItems.map((item) => {
          const isActive = item.route === activeRoute
          return (
            <button
              key={item.route}
              type="button"
              className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="sidebar__icon">
                <Icon name={item.icon} className="icon" />
              </span>
              <span className="sidebar__label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar__section">
        <div className="sidebar__sectionTitle">RELATÓRIOS</div>
        <nav className="sidebar__nav" aria-label="Relatórios">
          {reportItems.map((item) => {
            const isActive = item.route === activeRoute
            return (
              <button
                key={item.route}
                type="button"
                className={`sidebar__link sidebar__link--compact ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={() => navigate(item.route)}
              >
                <span className="sidebar__label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

