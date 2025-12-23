import { useEffect, useMemo, useState } from 'react'
import { apiGetAllPaginated, apiGetPaginated, apiSend } from '../lib/api'
import { formatBRL } from '../lib/format'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'

type CategoryResponse = {
  id: string
  description: string
  purpose: 'Income' | 'Expense' | 'Both'
}

type TransactionResponse = {
  id: string
  description: string
  amount: number
  type: 'Income' | 'Expense'
  personId: string
  categoryId: string
}

function purposeLabel(purpose: CategoryResponse['purpose']) {
  if (purpose === 'Income') return 'Receita'
  if (purpose === 'Expense') return 'Despesa'
  return 'Ambas'
}

function purposeBadgeClass(purpose: CategoryResponse['purpose']) {
  if (purpose === 'Income') return 'badge--income'
  if (purpose === 'Expense') return 'badge--expense'
  return 'badge--both'
}

function hashHue(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0
  return Math.abs(hash) % 360
}

function generateDistinctColors(ids: string[]) {
  const used = new Set<number>()
  const map = new Map<string, string>()

  for (const id of ids) {
    let hue = hashHue(id)
    while (used.has(hue)) hue = (hue + 23) % 360
    used.add(hue)
    map.set(id, `hsl(${hue} 82% 48%)`)
  }

  return map
}

function gradientFrom(base: string) {
  return `linear-gradient(135deg, color-mix(in srgb, ${base} 92%, #000 8%), color-mix(in srgb, ${base} 92%, #fff 8%))`
}

function useCategoryData(options: { page: number; pageSize: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [allCategories, setAllCategories] = useState<CategoryResponse[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      try {
        const allTransactions = await apiGetAllPaginated<TransactionResponse>({ path: '/api/v1.0/transaction/All', signal })
        if (signal.aborted) return
        setTransactions(allTransactions)
      } catch {
        if (signal.aborted) return
        setTransactions([])
      }
    }

    void load()
    return () => controller.abort()
  }, [refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      try {
        const all = await apiGetAllPaginated<CategoryResponse>({ path: '/api/v1.0/category/All', signal })
        if (signal.aborted) return
        setAllCategories(all)
      } catch {
        if (signal.aborted) return
        setAllCategories([])
      }
    }

    void load()
    return () => controller.abort()
  }, [refreshKey])

  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      setIsLoading(true)
      try {
        const res = await apiGetPaginated<CategoryResponse>({
          path: '/api/v1.0/category/All',
          page: options.page,
          pageSize: options.pageSize,
          signal,
        })

        if (signal.aborted) return
        setCategories(res.data ?? [])
        setTotalPages(Math.max(1, Number(res.totalPages) || 1))
        setTotalRecords(Math.max(0, Number(res.totalRecords) || 0))
      } finally {
        setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [options.page, options.pageSize, refreshKey])

  const statsByCategoryId = useMemo(() => {
    const map = new Map<string, { totalAmount: number; count: number }>()
    for (const t of transactions) {
      const current = map.get(t.categoryId) ?? { totalAmount: 0, count: 0 }
      current.totalAmount += Number(t.amount) || 0
      current.count += 1
      map.set(t.categoryId, current)
    }
    return map
  }, [transactions])

  return { isLoading, categories, allCategories, totalPages, totalRecords, statsByCategoryId, refresh: reload }
}

export function CategoryPage() {
  const [page, setPage] = useState(1)
  const pageSize = 8
  const data = useCategoryData({ page, pageSize })
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [description, setDescription] = useState('')
  const [purpose, setPurpose] = useState<CategoryResponse['purpose'] | ''>('')
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data.categories
    return data.categories.filter((c) => c.description.toLowerCase().includes(q))
  }, [data.categories, search])

  useEffect(() => {
    if (page > data.totalPages) setPage(data.totalPages)
  }, [data.totalPages, page])

  const colors = useMemo(() => generateDistinctColors(data.allCategories.map((c) => c.id)), [data.allCategories])

  const rankedForCards = useMemo(() => {
    const ranked = [...data.allCategories].map((c) => {
      const stats = data.statsByCategoryId.get(c.id) ?? { totalAmount: 0, count: 0 }
      return { category: c, ...stats }
    })

    ranked.sort((a, b) => b.totalAmount - a.totalAmount)
    return ranked.slice(0, 3)
  }, [data.allCategories, data.statsByCategoryId])

  const openModal = () => {
    setFormError(null)
    setDescription('')
    setPurpose('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
  }

  const isDescriptionValid = description.trim().length >= 3
  const canSave = isDescriptionValid && purpose !== '' && !isSaving

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!canSave) return
    setIsSaving(true)
    try {
      await apiSend<CategoryResponse>({
        method: 'POST',
        path: '/api/v1.0/category',
        body: { description: description.trim(), purpose },
      })
      closeModal()
      data.refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="categoryPage">
      <section className="pageCard">
        <div className="pageCard__header">
          <div>
            <div className="pageCard__title">Gerenciar Categorias</div>
            <div className="pageCard__subtitle">Cadastro e listagem de categorias</div>
          </div>
          <button type="button" className="primaryButton" onClick={openModal}>
            <Icon name="plus" className="icon primaryButton__icon" />
            Nova Categoria
          </button>
        </div>

        <div className="pageCard__toolbar">
          <label className="pageSearch" aria-label="Buscar por descrição">
            <Icon name="search" className="icon pageSearch__icon" />
            <input
              className="pageSearch__input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
            />
          </label>
        </div>

        {data.isLoading ? (
          <div className="pageCard__body">
            <EmptyState title="Carregando..." description="Buscando categorias cadastradas." />
          </div>
        ) : data.categories.length === 0 ? (
          <div className="pageCard__body">
            <EmptyState title="Nenhuma categoria cadastrada" description="Cadastre uma nova categoria para começar." />
          </div>
        ) : (
          <div className="pageCard__body">
            <div className="categoryCards">
              {rankedForCards.map(({ category, count, totalAmount }) => {
                const base = colors.get(category.id) ?? 'hsl(205 82% 48%)'
                return (
                  <div key={category.id} className="categoryCard" style={{ background: gradientFrom(base) }}>
                    <div className="categoryCard__top">
                      <div className="categoryCard__icon">
                        <Icon
                          name={category.purpose === 'Income' ? 'trendUp' : category.purpose === 'Expense' ? 'home' : 'tag'}
                          className="icon"
                        />
                      </div>
                      <span className={`categoryCard__badge ${purposeBadgeClass(category.purpose)}`}>{purposeLabel(category.purpose)}</span>
                    </div>
                    <div className="categoryCard__title">{category.description}</div>
                    <div className="categoryCard__meta">
                      {formatBRL(totalAmount)} · {count} transações
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Nenhuma categoria encontrada" description="Tente buscar por outro termo." />
            ) : (
              <>
                <div className="tableWrap">
                  <table className="table categoryTable">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Finalidade</th>
                        <th className="categoryTable__transactions">Transações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => {
                        const stats = data.statsByCategoryId.get(c.id) ?? { totalAmount: 0, count: 0 }
                        return (
                          <tr key={c.id}>
                            <td className="categoryTable__desc">
                              <span className="categoryDot" style={{ backgroundColor: colors.get(c.id) }} />
                              <span className="categoryTable__name">{c.description}</span>
                            </td>
                            <td>
                              <span className={`badge ${purposeBadgeClass(c.purpose)}`}>{purposeLabel(c.purpose)}</span>
                            </td>
                            <td className="categoryTable__transactions">{stats.count} transações</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="peopleFooter">
                  <div className="peopleFooter__info">Mostrando {filtered.length} de {data.totalRecords} categorias</div>
                  <div className="pagination" role="navigation" aria-label="Paginação">
                    <button type="button" className="paginationButton" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <Icon name="chevronLeft" className="icon" />
                    </button>
                    {Array.from({ length: data.totalPages }).map((_, i) => {
                      const number = i + 1
                      const isActive = number === page
                      return (
                        <button
                          key={number}
                          type="button"
                          className={`paginationButton ${isActive ? 'paginationButton--active' : ''}`}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      className="paginationButton"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                    >
                      <Icon name="chevronRight" className="icon" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <Modal title="Nova Categoria" isOpen={isModalOpen} onClose={closeModal}>
        <form className="form" onSubmit={submit}>
          <div className="formField">
            <label className="formLabel" htmlFor="categoryDescription">
              Descrição
            </label>
            <input
              id="categoryDescription"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição"
              autoFocus
            />
            {!isDescriptionValid && description !== '' ? <div className="formError">A descrição deve ter no mínimo 3 caracteres</div> : null}
          </div>

          <div className="formField">
            <label className="formLabel" htmlFor="categoryPurpose">
              Finalidade
            </label>
            <select id="categoryPurpose" className="input" value={purpose} onChange={(e) => setPurpose(e.target.value as CategoryResponse['purpose'])}>
              <option value="" disabled>
                Selecione a finalidade
              </option>
              <option value="Income">Receita</option>
              <option value="Expense">Despesa</option>
              <option value="Both">Ambas</option>
            </select>
          </div>

          {formError ? <div className="formError formError--box">{formError}</div> : null}

          <div className="formActions">
            <button type="button" className="secondaryButton" onClick={closeModal} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primaryButton primaryButton--wide" disabled={!canSave}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
