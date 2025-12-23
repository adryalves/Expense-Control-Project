import { Icon } from '../Icon'

export function StatCard({
  title,
  value,
  accent,
  icon,
  subtitle,
}: {
  title: string
  value: string
  accent: 'blue' | 'red' | 'green' | 'purple'
  icon: Parameters<typeof Icon>[0]['name']
  subtitle?: string
}) {
  return (
    <div className={`statCard statCard--${accent}`}>
      <div className="statCard__body">
        <div className="statCard__title">{title}</div>
        <div className="statCard__value">{value}</div>
        {subtitle ? <div className="statCard__subtitle">{subtitle}</div> : null}
      </div>
      <div className="statCard__iconWrap">
        <Icon name={icon} className="icon statCard__icon" />
      </div>
    </div>
  )
}

