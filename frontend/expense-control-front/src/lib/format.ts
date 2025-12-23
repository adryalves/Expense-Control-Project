export function formatBRL(value: number) {
  const n = Number(value) || 0
  const abs = Math.abs(n)
  const formattedAbs = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(abs).replace(/\u00A0/g, ' ')

  if (n < 0) return formattedAbs.replace(/^R\$\s*/, 'R$ -')
  return formattedAbs
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0][0]!.toUpperCase()
  return `${parts[0][0]!.toUpperCase()}${parts[parts.length - 1]![0]!.toUpperCase()}`
}
