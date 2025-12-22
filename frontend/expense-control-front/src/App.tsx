import './App.css'

import { useMemo } from 'react'

import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { type RouteKey, useHashRoute } from './lib/router'
import { DashboardPage } from './pages/DashboardPage'
import { CategoryPage } from './pages/CategoryPage'
import { PeoplePage } from './pages/PeoplePage'
import { TransactionsPage } from './pages/TransactionsPage'
import { ReportPersonPage } from './pages/ReportPersonPage'
import { ReportCategoryPage } from './pages/ReportCategoryPage'

function pageTitle(route: RouteKey) {
  switch (route) {
    case 'dashboard':
      return 'Dashboard'
    case 'people':
      return 'Pessoas'
    case 'categories':
      return 'Categorias'
    case 'transactions':
      return 'Transações'
    case 'report-person':
      return 'Totais por Pessoa'
    case 'report-category':
      return 'Totais por Categoria'
  }
}

export default function App() {
  const route = useHashRoute()

  const content = useMemo(() => {
    switch (route) {
      case 'dashboard':
        return <DashboardPage />
      case 'people':
        return <PeoplePage />
      case 'categories':
        return <CategoryPage />
      case 'transactions':
        return <TransactionsPage />
      case 'report-person':
        return <ReportPersonPage />
      case 'report-category':
        return <ReportCategoryPage />
    }
  }, [route])

  return (
    <div className="appShell">
      <Sidebar activeRoute={route} />
      <div className="appShell__main">
        <Topbar title={pageTitle(route)} />
        <main className="content">{content}</main>
      </div>
    </div>
  )
}
