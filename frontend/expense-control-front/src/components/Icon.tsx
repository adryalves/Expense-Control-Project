export function Icon({
  name,
  className,
}: {
  name:
    | 'home'
    | 'users'
    | 'tag'
    | 'arrows'
    | 'search'
    | 'bell'
    | 'trendUp'
    | 'trendDown'
    | 'wallet'
    | 'usersGroup'
    | 'plus'
    | 'edit'
    | 'trash'
    | 'close'
    | 'chevronLeft'
    | 'chevronRight'
  className?: string
}) {
  const common = { className, 'aria-hidden': true as const, focusable: false as const }
  switch (name) {
    case 'home':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'users':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-10 9a6 6 0 0 1 12 0v1H6v-1Zm13.5-6.8a3.5 3.5 0 1 0-2.3 6.2 5 5 0 0 1 3.8 4.6V22H22v-1.9a6.9 6.9 0 0 0-2.5-5.9Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'tag':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M20.6 13.9 13.9 20.6a2 2 0 0 1-2.8 0L3 12.5V3h9.5l8.1 8.1a2 2 0 0 1 0 2.8ZM7.5 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'arrows':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M7 7h11l-3.5-3.5L16 2l6 6-6 6-1.5-1.5L18 9H7V7Zm10 10H6l3.5 3.5L8 22l-6-6 6-6 1.5 1.5L6 15h11v2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'search':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M10 18a8 8 0 1 1 5.3-14A8 8 0 0 1 10 18Zm11 3-6-6 1.4-1.4 6 6L21 21Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6V11a8 8 0 0 0-6-7.75V2h-4v1.25A8 8 0 0 0 4 11v5l-2 2v1h22v-1l-2-2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'trendUp':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 17 9 11l4 4 8-8v5h2V3h-9v2h5l-6 6-4-4-7 7 1 3Z" fill="currentColor" />
        </svg>
      )
    case 'trendDown':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 7 9 13l4-4 8 8v-5h2v9h-9v-2h5l-6-6-4 4-7-7 1-3Z" fill="currentColor" />
        </svg>
      )
    case 'wallet':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M4 7a3 3 0 0 1 3-3h12v2H7a1 1 0 0 0 0 2h14a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm15 7a2 2 0 1 0 0 4h3v-4h-3Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'usersGroup':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-10 9a6 6 0 0 1 12 0v1H6v-1Zm16-8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1 8v1h-2v-1a5.5 5.5 0 0 0-2.7-4.7 5 5 0 0 1 6.7 4.7Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
        </svg>
      )
    case 'edit':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M4 17.25V20h2.75L17.8 8.95l-2.75-2.75L4 17.25Zm16.7-10.2a1 1 0 0 0 0-1.4l-1.35-1.35a1 1 0 0 0-1.4 0l-1.05 1.05 2.75 2.75 1.05-1.05Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'trash':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M6 7h12l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Zm3-4h6l1 2H8l1-2Zm-3 2h12v2H6V5Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'close':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path
            d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'chevronLeft':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M15.4 7.4 10.8 12l4.6 4.6-1.4 1.4L8 12l6-6 1.4 1.4Z" fill="currentColor" />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M8.6 16.6 13.2 12 8.6 7.4 10 6l6 6-6 6-1.4-1.4Z" fill="currentColor" />
        </svg>
      )
  }
}

