import { useEffect, useMemo, useState } from 'react'
import { apiGetAllPaginated, apiGetPaginated, apiSend } from '../lib/api'
import { Icon } from '../components/Icon'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'

type PersonResponse = {
  id: string
  name: string
  age: number
}

type TransactionResponse = {
  id: string
  description: string
  amount: number
  type: 'Income' | 'Expense'
  personId: string
  categoryId: string
}

function statusLabel(age: number) {
  return age >= 18 ? 'Maior de idade' : 'Menor de idade'
}

function statusClass(age: number) {
  return age >= 18 ? 'badge--adult' : 'badge--minor'
}

function usePeopleData(options: { page: number; pageSize: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [people, setPeople] = useState<PersonResponse[]>([])
  const [allPeople, setAllPeople] = useState<PersonResponse[] | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      try {
        const all = await apiGetAllPaginated<PersonResponse>({ path: '/api/v1.0/person/All', signal })
        if (signal.aborted) return
        setAllPeople(all)
      } catch {
        if (signal.aborted) return
        setAllPeople(null)
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

  const reload = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      setIsLoading(true)
      try {
        const res = await apiGetPaginated<PersonResponse>({
          path: '/api/v1.0/person/All',
          page: options.page,
          pageSize: options.pageSize,
          signal,
        })

        if (signal.aborted) return
        setPeople(res.data ?? [])
        setTotalPages(Math.max(1, Number(res.totalPages) || 1))
        setTotalRecords(Math.max(0, Number(res.totalRecords) || 0))
      } finally {
        setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [options.page, options.pageSize, refreshKey])

  const transactionCountByPersonId = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) map.set(t.personId, (map.get(t.personId) ?? 0) + 1)
    return map
  }, [transactions])

  return { isLoading, people, allPeople, totalPages, totalRecords, transactionCountByPersonId, refresh: reload }
}

function PeopleTable({
  people,
  transactionCountByPersonId,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  isDeletingId,
}: {
  people: PersonResponse[]
  transactionCountByPersonId: Map<string, number>
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (next: number | ((prev: number) => number)) => void
  onEdit: (person: PersonResponse) => void
  onDelete: (person: PersonResponse) => void
  isDeletingId: string | null
}) {
  return (
    <div className="pageCard__body">
      <div className="tableWrap">
        <table className="table peopleTable">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Idade</th>
              <th>Status</th>
              <th>Transações</th>
              <th className="peopleTable__actionsHead">Ações</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const txCount = transactionCountByPersonId.get(p.id) ?? 0
              return (
                <tr key={p.id}>
                  <td className="peopleTable__name">{p.name}</td>
                  <td>{p.age} anos</td>
                  <td>
                    <span className={`badge ${statusClass(p.age)}`}>{statusLabel(p.age)}</span>
                  </td>
                  <td>{txCount} transações</td>
                  <td className="peopleTable__actionsCell">
                    <div className="rowActions">
                      <button
                        type="button"
                        className="iconButton iconButton--edit"
                        onClick={() => onEdit(p)}
                        disabled={isDeletingId === p.id}
                        aria-label="Editar"
                      >
                        <Icon name="edit" className="icon" />
                      </button>
                      <button
                        type="button"
                        className="iconButton iconButton--delete"
                        onClick={() => void onDelete(p)}
                        disabled={isDeletingId === p.id}
                        aria-label="Excluir"
                      >
                        <Icon name="trash" className="icon" />
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
        <div className="peopleFooter__info">Mostrando {people.length} de {totalCount} pessoas</div>
        <div className="pagination" role="navigation" aria-label="Paginação">
          <button type="button" className="paginationButton" onClick={() => onPageChange((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <Icon name="chevronLeft" className="icon" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const number = i + 1
            const isActive = number === page
            return (
              <button
                key={number}
                type="button"
                className={`paginationButton ${isActive ? 'paginationButton--active' : ''}`}
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            )
          })}
          <button
            type="button"
            className="paginationButton"
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <Icon name="chevronRight" className="icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PersonModal({
  title,
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  name,
  onNameChange,
  age,
  onAgeChange,
  isAgeValid,
  canSave,
  formError,
  submitLabel,
}: {
  title: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isSaving: boolean
  name: string
  onNameChange: (next: string) => void
  age: string
  onAgeChange: (next: string) => void
  isAgeValid: boolean
  canSave: boolean
  formError: string | null
  submitLabel: string
}) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        <div className="formField">
          <label className="formLabel" htmlFor="personName">
            Nome
          </label>
          <input
            id="personName"
            className="input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Digite o nome"
            autoFocus
          />
        </div>

        <div className="formField">
          <label className="formLabel" htmlFor="personAge">
            Idade
          </label>
          <input
            id="personAge"
            className="input"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder="Digite a idade"
            inputMode="numeric"
            min={1}
            max={130}
            type="number"
          />
          {!isAgeValid && age !== '' ? <div className="formError">A idade deve estar entre 1 e 130</div> : null}
        </div>

        {formError ? <div className="formError formError--box">{formError}</div> : null}

        <div className="formActions">
          <button type="button" className="secondaryButton" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" className="primaryButton primaryButton--wide" disabled={!canSave}>
            {isSaving ? `${submitLabel}...` : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function PeoplePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const data = usePeopleData({ page, pageSize })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [editingPerson, setEditingPerson] = useState<PersonResponse | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PersonResponse | null>(null)

  const [name, setName] = useState('')
  const [age, setAge] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data.people
    return data.people.filter((p) => p.name.toLowerCase().includes(q))
  }, [data.people, search])

  useEffect(() => {
    if (page > data.totalPages) setPage(data.totalPages)
  }, [data.totalPages, page])

  const openCreateModal = () => {
    setFormError(null)
    setEditingPerson(null)
    setName('')
    setAge('')
    setIsModalOpen(true)
  }

  const openEditModal = (person: PersonResponse) => {
    setFormError(null)
    setEditingPerson(person)
    setName(person.name)
    setAge(String(person.age))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingPerson(null)
  }

  const ageNumber = age === '' ? NaN : Number(age)
  const isAgeValid = Number.isInteger(ageNumber) && ageNumber >= 1 && ageNumber <= 130
  const isNameValid = name.trim().length > 0
  const canSave = isNameValid && isAgeValid && !isSaving

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!canSave) return

    const normalizedName = name.trim().toLocaleLowerCase()
    if (data.allPeople) {
      const duplicate = data.allPeople.find((p) => p.id !== editingPerson?.id && p.name.trim().toLocaleLowerCase() === normalizedName)
      if (duplicate) {
        setFormError('Já existe uma pessoa cadastrada com esse nome')
        return
      }
    }

    setIsSaving(true)
    try {
      if (editingPerson) {
        await apiSend<PersonResponse>({
          method: 'PUT',
          path: `/api/v1.0/person?id=${encodeURIComponent(editingPerson.id)}`,
          body: { name: name.trim(), age: ageNumber },
        })
      } else {
        await apiSend<PersonResponse>({
          method: 'POST',
          path: '/api/v1.0/person',
          body: { name: name.trim(), age: ageNumber },
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

  const openDeleteModal = (person: PersonResponse) => {
    if (isDeletingId) return
    setDeleteTarget(person)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (isDeletingId) return
    setIsDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    if (isDeletingId) return
    setIsDeletingId(deleteTarget.id)
    try {
      await apiSend<boolean>({ method: 'DELETE', path: `/api/v1.0/person?id=${encodeURIComponent(deleteTarget.id)}` })
      data.refresh()
    } catch {
      data.refresh()
    } finally {
      setIsDeletingId(null)
      setIsDeleteModalOpen(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="peoplePage">
      <section className="pageCard">
        <div className="pageCard__header">
          <div>
            <div className="pageCard__title">Gerenciar Pessoas</div>
            <div className="pageCard__subtitle">Cadastro e listagem de pessoas</div>
          </div>
          <button type="button" className="primaryButton" onClick={openCreateModal}>
            <Icon name="plus" className="icon primaryButton__icon" />
            Nova Pessoa
          </button>
        </div>

        <div className="pageCard__toolbar">
          <label className="pageSearch" aria-label="Buscar por nome">
            <Icon name="search" className="icon pageSearch__icon" />
            <input
              className="pageSearch__input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
            />
          </label>
        </div>

        {data.isLoading ? (
          <div className="pageCard__body">
            <EmptyState title="Carregando..." description="Buscando pessoas cadastradas." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="pageCard__body">
            <EmptyState title="Nenhuma pessoa encontrada" description="Cadastre uma nova pessoa para começar." />
          </div>
        ) : (
          <PeopleTable
            people={filtered}
            transactionCountByPersonId={data.transactionCountByPersonId}
            page={page}
            totalPages={data.totalPages}
            totalCount={data.totalRecords}
            onPageChange={setPage}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            isDeletingId={isDeletingId}
          />
        )}
      </section>

      <PersonModal
        title={editingPerson ? 'Editar Pessoa' : 'Nova Pessoa'}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={submit}
        isSaving={isSaving}
        name={name}
        onNameChange={setName}
        age={age}
        onAgeChange={setAge}
        isAgeValid={isAgeValid}
        canSave={canSave}
        formError={formError}
        submitLabel={editingPerson ? 'Atualizar' : 'Salvar'}
      />

      <Modal title="Confirmar exclusão" isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <div className="form">
          <div>
            Tem certeza que deseja excluir <strong>{deleteTarget?.name ?? 'esta pessoa'}</strong>?
          </div>
          <div className="formActions">
            <button type="button" className="secondaryButton" onClick={closeDeleteModal} disabled={Boolean(isDeletingId)}>
              Cancelar
            </button>
            <button type="button" className="primaryButton primaryButton--wide" onClick={() => void confirmDelete()} disabled={!deleteTarget || Boolean(isDeletingId)}>
              {isDeletingId ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
