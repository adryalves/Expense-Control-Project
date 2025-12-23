import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import { formatBRL } from '../lib/format'
import { EmptyState } from '../components/ui/EmptyState'

type CategoryPurpose = 'Income' | 'Expense' | 'Both'

type CategorySummaryItem = {
  id: string
  description: string
  purpose: CategoryPurpose
  income: number
  expense: number
  balance: number
}

type CategoriesSummaryResponse = {
  categorySummary: CategorySummaryItem[]
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

function purposeLabel(purpose: CategoryPurpose) {
  if (purpose === 'Income') return 'Receita'
  if (purpose === 'Expense') return 'Despesa'
  return 'Ambas'
}

function purposeBadgeClass(purpose: CategoryPurpose) {
  if (purpose === 'Income') return 'badge--income'
  if (purpose === 'Expense') return 'badge--expense'
  return 'badge--both'
}

function useCategoriesSummaryData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CategoriesSummaryResponse | null>(null)

  const reload = () => {
    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiGet<CategoriesSummaryResponse>('/api/v1.0/category/GetCategoriesSummary')
        if (!active) return
        setData(res)
      } catch (err) {
        if (!active) return
        setData(null)
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o relatório')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }

  useEffect(() => reload(), [])

  return { isLoading, error, data, refresh: reload }
}

export function ReportCategoryPage() {
  const report = useCategoriesSummaryData()

  const rows = useMemo(() => {
    const list = report.data?.categorySummary ?? []
    return list.slice().sort((a, b) => a.description.localeCompare(b.description))
  }, [report.data?.categorySummary])

  const totals = useMemo(() => {
    if (report.data) {
      return {
        totalIncome: Number(report.data.totalIncome) || 0,
        totalExpense: Number(report.data.totalExpense) || 0,
        totalBalance: Number(report.data.totalBalance) || 0,
      }
    }

    const totalIncome = rows.reduce((acc, r) => acc + (Number(r.income) || 0), 0)
    const totalExpense = rows.reduce((acc, r) => acc + (Number(r.expense) || 0), 0)
    return { totalIncome, totalExpense, totalBalance: totalIncome - totalExpense }
  }, [report.data, rows])

  return (
    <div className="categoryPage">
      <section className="pageCard">
        <div className="pageCard__header">
          <div>
            <div className="pageCard__title">Totais por Categoria</div>
            <div className="pageCard__subtitle">Receitas, despesas e saldo por categoria</div>
          </div>
        </div>

        {report.isLoading ? (
          <div className="pageCard__body">
            <EmptyState title="Carregando..." description="Buscando totais por categoria." />
          </div>
        ) : report.error ? (
          <div className="pageCard__body">
            <EmptyState title="Não foi possível carregar" description={report.error} />
          </div>
        ) : rows.length === 0 ? (
          <div className="pageCard__body">
            <EmptyState title="Nenhum dado encontrado" description="Cadastre transações para visualizar o relatório." />
          </div>
        ) : (
          <div className="pageCard__body">
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Finalidade</th>
                    <th className="table__right">Receitas</th>
                    <th className="table__right">Despesas</th>
                    <th className="table__right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const income = Number(c.income) || 0
                    const expense = Number(c.expense) || 0
                    const balance = Number(c.balance) || income - expense
                    const balanceClass = balance >= 0 ? 'table__income' : 'table__expense'
                    return (
                      <tr key={c.id}>
                        <td className="categoryTable__name">{c.description}</td>
                        <td>
                          <span className={`badge ${purposeBadgeClass(c.purpose)}`}>{purposeLabel(c.purpose)}</span>
                        </td>
                        <td className="table__right table__income">{formatBRL(income)}</td>
                        <td className="table__right table__expense">{formatBRL(expense)}</td>
                        <td className={`table__right ${balanceClass}`}>{formatBRL(balance)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Geral</td>
                    <td />
                    <td className="table__right table__income">{formatBRL(totals.totalIncome)}</td>
                    <td className="table__right table__expense">{formatBRL(totals.totalExpense)}</td>
                    <td className={`table__right ${totals.totalBalance >= 0 ? 'table__income' : 'table__expense'}`}>
                      {formatBRL(totals.totalBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
