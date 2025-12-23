import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import { formatBRL } from '../lib/format'
import { EmptyState } from '../components/ui/EmptyState'

type PersonSummaryItem = {
  id: string
  name: string
  age: number
  income: number
  expense: number
  balance: number
}

type PeopleSummaryResponse = {
  personSummary: PersonSummaryItem[]
  totalIncome: number
  totalExpense: number
  totalBalance: number
}

function usePeopleSummaryData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PeopleSummaryResponse | null>(null)

  const reload = () => {
    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiGet<PeopleSummaryResponse>('/api/v1.0/person/GetPeopleSummary')
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

export function ReportPersonPage() {
  const report = usePeopleSummaryData()

  const rows = useMemo(() => {
    const list = report.data?.personSummary ?? []
    return list.slice().sort((a, b) => a.name.localeCompare(b.name))
  }, [report.data?.personSummary])

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
    <div className="peoplePage">
      <section className="pageCard">
        <div className="pageCard__header">
          <div>
            <div className="pageCard__title">Totais por Pessoa</div>
            <div className="pageCard__subtitle">Receitas, despesas e saldo por pessoa</div>
          </div>
        </div>

        {report.isLoading ? (
          <div className="pageCard__body">
            <EmptyState title="Carregando..." description="Buscando totais por pessoa." />
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
                    <th>Pessoa</th>
                    <th className="table__right">Receitas</th>
                    <th className="table__right">Despesas</th>
                    <th className="table__right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const income = Number(p.income) || 0
                    const expense = Number(p.expense) || 0
                    const balance = Number(p.balance) || income - expense
                    const balanceClass = balance >= 0 ? 'table__income' : 'table__expense'
                    return (
                      <tr key={p.id}>
                        <td className="peopleTable__name">{p.name}</td>
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
