import { useEffect, useState } from 'react'
import { apiGet, apiGetAllPaginated, apiGetPaginated } from '../lib/api'
import { formatBRL } from '../lib/format'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { StatCard } from '../components/ui/StatCard'
import { navigate } from '../lib/router'

type CategoriesSummaryResponse = {
  categorySummary: Array<{
    id: string
    description: string
    purpose: string
    income: number
    expense: number
    balance: number
  }>
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

type PeopleSummaryResponse = {
  personSummary: Array<{
    id: string
    name: string
    age: number
    income: number
    expense: number
    balance: number
  }>
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

type PersonResponse = {
  id: string
  name: string
  age: number
}

type CategoryResponse = {
  id: string
  description: string
  purpose: string
}

type TransactionResponse = {
  id: string
  description: string
  amount: number
  type: 'Income' | 'Expense'
  personId: string
  categoryId: string
}

type DashboardData = {
  totals: {
    income: number
    expense: number
    balance: number
    peopleCount: number
  }
  recentTransactions: Array<{
    id: string
    description: string
    personName: string
    categoryName: string
    type: 'Income' | 'Expense'
    amount: number
  }>
  isLoading: boolean
}

function useDashboardData(): DashboardData {
  const [isLoading, setIsLoading] = useState(true)
  const [totals, setTotals] = useState<DashboardData['totals']>({
    income: 0,
    expense: 0,
    balance: 0,
    peopleCount: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<DashboardData['recentTransactions']>([])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      setIsLoading(true)
      try {
        const results = await Promise.allSettled([
          apiGet<CategoriesSummaryResponse>('/api/v1.0/category/GetCategoriesSummary', signal),
          apiGet<PeopleSummaryResponse>('/api/v1.0/person/GetPeopleSummary', signal),
          apiGetAllPaginated<PersonResponse>({ path: '/api/v1.0/person/All', signal }),
          apiGetAllPaginated<CategoryResponse>({ path: '/api/v1.0/category/All', signal }),
          apiGetPaginated<TransactionResponse>({ path: '/api/v1.0/transaction/All', page: 1, pageSize: 5, signal }),
        ] as const)

        const categoriesSummaryRes = results[0].status === 'fulfilled' ? results[0].value : null
        const peopleSummaryRes = results[1].status === 'fulfilled' ? results[1].value : null
        const people = results[2].status === 'fulfilled' ? results[2].value : []
        const categories = results[3].status === 'fulfilled' ? results[3].value : []
        const transactions = results[4].status === 'fulfilled' ? results[4].value.data : []

        const peopleById = new Map(people.map((p) => [p.id, p.name]))
        const categoriesById = new Map(categories.map((c) => [c.id, c.description]))

        const normalizedTransactions = (transactions ?? []).slice(0, 5).map((t) => ({
          id: t.id,
          description: t.description,
          personName: peopleById.get(t.personId) ?? '—',
          categoryName: categoriesById.get(t.categoryId) ?? '—',
          type: t.type,
          amount: t.amount,
        }))

        setTotals({
          income: Number(categoriesSummaryRes?.totalIncome ?? 0),
          expense: Number(categoriesSummaryRes?.totalExpense ?? 0),
          balance: Number(categoriesSummaryRes?.totalBalance ?? 0),
          peopleCount: Number(peopleSummaryRes?.personSummary?.length ?? 0),
        })
        setRecentTransactions(normalizedTransactions)
      } catch {
        if (signal.aborted) return
        setTotals({ income: 0, expense: 0, balance: 0, peopleCount: 0 })
        setRecentTransactions([])
      } finally {
        if (!signal.aborted) setIsLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [])

  return { totals, recentTransactions, isLoading }
}

export function DashboardPage() {
  const data = useDashboardData()

  return (
    <div className="dashboard dashboard--enhanced">
      <div className="statsGrid dashboardStats">
        <StatCard title="Total Receitas" value={formatBRL(data.totals.income)} accent="blue" icon="trendUp" />
        <StatCard title="Total Despesas" value={formatBRL(data.totals.expense)} accent="red" icon="trendDown" />
        <StatCard
          title="Saldo Líquido"
          value={formatBRL(data.totals.balance)}
          accent="green"
          icon="wallet"
          subtitle={data.totals.balance >= 0 ? 'Positivo' : 'Negativo'}
        />
        <StatCard title="Total Pessoas" value={String(data.totals.peopleCount)} accent="purple" icon="usersGroup" subtitle="Cadastradas" />
      </div>

      <Panel
        title="Transações"
        right={
          <button type="button" className="linkButton" onClick={() => navigate('transactions')}>
            Ver todas
          </button>
        }
      >
        {data.recentTransactions.length === 0 ? (
          <EmptyState title="Nenhuma transação cadastrada" description="Quando você criar transações, elas aparecerão aqui." />
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Pessoa</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th className="table__right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.description}</td>
                    <td>{t.personName}</td>
                    <td>{t.categoryName}</td>
                    <td>
                      <span className={`badge ${t.type === 'Income' ? 'badge--income' : 'badge--expense'}`}>
                        {t.type === 'Income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`table__right ${t.type === 'Income' ? 'table__income' : 'table__expense'}`}>{formatBRL(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
