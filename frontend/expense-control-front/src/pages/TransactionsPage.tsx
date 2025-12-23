import { useEffect, useMemo, useState } from 'react'
import { apiGetAllPaginated, apiGetPaginated, apiSend } from '../lib/api'
import { formatBRL } from '../lib/format'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'

type PersonResponse = {
  id: string
  name: string
  age: number
}

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

function typeLabel(type: TransactionResponse['type']) {
  return type === 'Income' ? 'Receita' : 'Despesa'
}

function isCategoryCompatible(category: CategoryResponse | undefined, type: TransactionResponse['type'] | '') {
  if (!category || type === '') return true
  if (category.purpose === 'Both') return true
  return category.purpose === type
}

function useTransactionsData(options: { page: number; pageSize: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [people, setPeople] = useState<PersonResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      setIsLoading(true)
      try {
        const [peopleRes, categoriesRes] = await Promise.allSettled([
          apiGetAllPaginated<PersonResponse>({ path: '/api/v1.0/person/All', signal }),
          apiGetAllPaginated<CategoryResponse>({ path: '/api/v1.0/category/All', signal }),
        ] as const)

        if (signal.aborted) return
        setPeople(peopleRes.status === 'fulfilled' ? peopleRes.value : [])
        setCategories(categoriesRes.status === 'fulfilled' ? categoriesRes.value : [])
      } finally {
        setIsLoading(false)
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
        const res = await apiGetPaginated<TransactionResponse>({
          path: '/api/v1.0/transaction/All',
          page: options.page,
          pageSize: options.pageSize,
          signal,
        })

        if (signal.aborted) return
        setTransactions(res.data ?? [])
        setTotalPages(Math.max(1, Number(res.totalPages) || 1))
        setTotalRecords(Math.max(0, Number(res.totalRecords) || 0))
      } finally {
        setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [options.page, options.pageSize, refreshKey])

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  return { isLoading, transactions, people, categories, peopleById, categoriesById, totalPages, totalRecords, refresh: reload }
}

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionResponse['type'] | ''>('')
  const [personFilterId, setPersonFilterId] = useState('')
  const [categoryFilterId, setCategoryFilterId] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const data = useTransactionsData({ page, pageSize })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionResponse['type'] | ''>('')
  const [personId, setPersonId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.transactions.filter((t) => {
      if (q && !t.description.toLowerCase().includes(q)) return false
      if (typeFilter && t.type !== typeFilter) return false
      if (personFilterId && t.personId !== personFilterId) return false
      if (categoryFilterId && t.categoryId !== categoryFilterId) return false
      return true
    })
  }, [categoryFilterId, data.transactions, personFilterId, search, typeFilter])

  useEffect(() => {
    if (page > data.totalPages) setPage(data.totalPages)
  }, [data.totalPages, page])

  const openCreateModal = () => {
    setFormError(null)
    setEditingTransaction(null)
    setDescription('')
    setAmount('')
    setType('')
    setPersonId('')
    setCategoryId('')
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: TransactionResponse) => {
    setFormError(null)
    setEditingTransaction(transaction)
    setDescription(transaction.description)
    setAmount(String(transaction.amount))
    setType(transaction.type)
    setPersonId(transaction.personId)
    setCategoryId(transaction.categoryId)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const selectedPerson = data.peopleById.get(personId)
  const selectedCategory = data.categoriesById.get(categoryId)

  const amountNumber = amount === '' ? NaN : Number(amount)
  const isDescriptionValid = description.trim().length >= 3
  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0
  const isMinorRuleValid = !(selectedPerson && selectedPerson.age < 18 && type === 'Income')
  const isCategoryRuleValid = isCategoryCompatible(selectedCategory, type)

  const canSave =
    isDescriptionValid &&
    isAmountValid &&
    type !== '' &&
    personId !== '' &&
    categoryId !== '' &&
    isMinorRuleValid &&
    isCategoryRuleValid &&
    !isSaving

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!canSave) return
    setIsSaving(true)
    try {
      if (editingTransaction) {
        await apiSend<TransactionResponse>({
          method: 'PUT',
          path: `/api/v1.0/transaction/${encodeURIComponent(editingTransaction.id)}`,
          body: {
            description: description.trim(),
            amount: amountNumber,
            type,
            personId,
            categoryId,
          },
        })
      } else {
        await apiSend<TransactionResponse>({
          method: 'POST',
          path: '/api/v1.0/transaction',
          body: {
            description: description.trim(),
            amount: amountNumber,
            type,
            personId,
            categoryId,
          },
        })
      }
      closeModal()
      data.refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="transactionsPage">
      <section className="pageCard">
        <div className="pageCard__header">
          <div>
            <div className="pageCard__title">Gerenciar Transações</div>
            <div className="pageCard__subtitle">Cadastro e listagem de transações</div>
          </div>
          <button type="button" className="primaryButton" onClick={openCreateModal}>
            <Icon name="plus" className="icon primaryButton__icon" />
            Nova Transação
          </button>
        </div>

        <div className="pageCard__toolbar">
          <div className="transactionsToolbar">
            <label className="pageSearch" aria-label="Buscar por descrição">
              <Icon name="search" className="icon pageSearch__icon" />
              <input
                className="pageSearch__input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descrição..."
              />
            </label>

            <select className="input transactionsToolbar__select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TransactionResponse['type'] | '')}>
              <option value="">Todos os tipos</option>
              <option value="Income">Receita</option>
              <option value="Expense">Despesa</option>
            </select>

            <select className="input transactionsToolbar__select" value={personFilterId} onChange={(e) => setPersonFilterId(e.target.value)}>
              <option value="">Todas as pessoas</option>
              {data.people
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            <select className="input transactionsToolbar__select" value={categoryFilterId} onChange={(e) => setCategoryFilterId(e.target.value)}>
              <option value="">Todas as categorias</option>
              {data.categories
                .slice()
                .sort((a, b) => a.description.localeCompare(b.description))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.description}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {data.isLoading ? (
          <div className="pageCard__body">
            <EmptyState title="Carregando..." description="Buscando transações cadastradas." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="pageCard__body">
            <EmptyState title="Nenhuma transação encontrada" description="Cadastre uma nova transação para começar." />
          </div>
        ) : (
          <div className="pageCard__body">
            <div className="tableWrap">
              <table className="table transactionsTable">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Pessoa</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th className="table__right">Valor</th>
                    <th className="peopleTable__actionsHead">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const personName = data.peopleById.get(t.personId)?.name ?? '—'
                    const categoryName = data.categoriesById.get(t.categoryId)?.description ?? '—'
                    return (
                      <tr key={t.id}>
                        <td className="transactionsTable__desc">{t.description}</td>
                        <td>{personName}</td>
                        <td>{categoryName}</td>
                        <td>
                          <span className={`badge ${t.type === 'Income' ? 'badge--income' : 'badge--expense'}`}>{typeLabel(t.type)}</span>
                        </td>
                        <td className={`table__right ${t.type === 'Income' ? 'table__income' : 'table__expense'}`}>{formatBRL(t.amount)}</td>
                        <td className="peopleTable__actionsCell">
                          <div className="rowActions">
                            <button
                              type="button"
                              className="iconButton iconButton--edit"
                              onClick={() => openEditModal(t)}
                              disabled={isSaving}
                              aria-label="Editar"
                            >
                              <Icon name="edit" className="icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="peopleFooter">
              <div className="peopleFooter__info">Mostrando {filtered.length} de {data.totalRecords} transações</div>
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
          </div>
        )}
      </section>

      <Modal title={editingTransaction ? 'Editar Transação' : 'Nova Transação'} isOpen={isModalOpen} onClose={closeModal}>
        <form className="form" onSubmit={submit}>
          <div className="formField">
            <label className="formLabel" htmlFor="transactionDescription">
              Descrição
            </label>
            <input
              id="transactionDescription"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição"
              autoFocus
            />
            {!isDescriptionValid && description !== '' ? <div className="formError">A descrição deve ter no mínimo 3 caracteres</div> : null}
          </div>

          <div className="formField">
            <label className="formLabel" htmlFor="transactionAmount">
              Valor
            </label>
            <input
              id="transactionAmount"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              min={0.01}
              step={0.01}
              type="number"
            />
            {!isAmountValid && amount !== '' ? <div className="formError">O valor precisa ser positivo</div> : null}
          </div>

          <div className="formField">
            <label className="formLabel" htmlFor="transactionType">
              Tipo
            </label>
            <select
              id="transactionType"
              className="input"
              value={type}
              onChange={(e) => {
                const next = e.target.value as TransactionResponse['type'] | ''
                setType(next)
              }}
            >
              <option value="" disabled>
                Selecione o tipo
              </option>
              <option value="Income">Receita</option>
              <option value="Expense">Despesa</option>
            </select>
            {!isMinorRuleValid ? <div className="formError">Menores de idade apenas podem ter transação de despesa</div> : null}
          </div>

          <div className="formField">
            <label className="formLabel" htmlFor="transactionPerson">
              Pessoa
            </label>
            <select id="transactionPerson" className="input" value={personId} onChange={(e) => setPersonId(e.target.value)}>
              <option value="" disabled>
                Selecione a pessoa
              </option>
              {data.people
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="formField">
            <label className="formLabel" htmlFor="transactionCategory">
              Categoria
            </label>
            <select id="transactionCategory" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>
                Selecione a categoria
              </option>
              {data.categories
                .slice()
                .sort((a, b) => a.description.localeCompare(b.description))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.description}
                  </option>
                ))}
            </select>
            {!isCategoryRuleValid ? <div className="formError">O tipo não corresponde com a finalidade da categoria</div> : null}
          </div>

          {formError ? <div className="formError formError--box">{formError}</div> : null}

          <div className="formActions">
            <button type="button" className="secondaryButton" onClick={closeModal} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primaryButton primaryButton--wide" disabled={!canSave}>
              {isSaving ? `${editingTransaction ? 'Atualizando' : 'Salvando'}...` : editingTransaction ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
