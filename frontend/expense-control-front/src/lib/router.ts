import { useEffect, useState } from 'react'

export type RouteKey =
  | 'dashboard'
  | 'people'
  | 'categories'
  | 'transactions'
  | 'report-person'
  | 'report-category'

export function parseRouteFromHash(hash: string): RouteKey {
  const value = hash.replace(/^#\/?/, '').trim()
  if (value === '') return 'dashboard'
  const known: RouteKey[] = ['dashboard', 'people', 'categories', 'transactions', 'report-person', 'report-category']
  return (known.includes(value as RouteKey) ? (value as RouteKey) : 'dashboard')
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteKey>(() => parseRouteFromHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseRouteFromHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(route: RouteKey) {
  window.location.hash = `#/${route}`
}

