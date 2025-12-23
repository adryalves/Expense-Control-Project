const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5145'

function normalizeApiUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

export type PaginatedResult<T> = {
  data: T[]
  currentPage: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${normalizeApiUrl(API_BASE_URL)}${path}`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

export async function apiGetPaginated<T>(options: { path: string; page: number; pageSize: number; signal?: AbortSignal }): Promise<PaginatedResult<T>> {
  const separator = options.path.includes('?') ? '&' : '?'
  const url = `${options.path}${separator}page=${encodeURIComponent(String(options.page))}&pageSize=${encodeURIComponent(String(options.pageSize))}`
  return apiGet<PaginatedResult<T>>(url, options.signal)
}

export async function apiGetAllPaginated<T>(options: { path: string; pageSize?: number; signal?: AbortSignal }): Promise<T[]> {
  const pageSize = Math.max(1, options.pageSize ?? 100)
  const pagesLimit = 100

  const first = await apiGetPaginated<T>({ path: options.path, page: 1, pageSize, signal: options.signal })
  const all = [...(first.data ?? [])]

  const declaredTotalPages = Math.max(1, Number(first.totalPages) || 1)
  if (declaredTotalPages > 1) {
    const totalPages = Math.min(declaredTotalPages, pagesLimit)
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await apiGetPaginated<T>({ path: options.path, page, pageSize, signal: options.signal })
      all.push(...(next.data ?? []))
    }
    return all
  }

  for (let page = 2; page <= pagesLimit; page += 1) {
    const next = await apiGetPaginated<T>({ path: options.path, page, pageSize, signal: options.signal })
    const batch = next.data ?? []
    if (batch.length === 0) break
    all.push(...batch)
    if (batch.length < pageSize) break
  }

  return all
}

export async function apiSend<TResponse>(options: {
  path: string
  method: 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}): Promise<TResponse> {
  const url = `${normalizeApiUrl(API_BASE_URL)}${options.path}`
  const response = await fetch(url, {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as TResponse
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return undefined as TResponse
  return (await response.json()) as TResponse
}
