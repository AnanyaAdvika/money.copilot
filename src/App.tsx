import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/Dashboard'
import { TransactionsPage } from '@/pages/Transactions'
import { AnalyticsPage } from '@/pages/Analytics'
import { BudgetsPage } from '@/pages/Budgets'
import { GoalsPage } from '@/pages/Goals'
import { RecurringPage } from '@/pages/Recurring'
import { CalendarPage } from '@/pages/Calendar'
import { CopilotPage } from '@/pages/Copilot'
import { SettingsPage } from '@/pages/Settings'
import { ScanPage } from '@/pages/Scan'
import { LeaksPage } from '@/pages/Leaks'
import { WhatIfPage } from '@/pages/WhatIf'
import { AffordPage } from '@/pages/Afford'

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="recurring" element={<RecurringPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="copilot" element={<CopilotPage />} />
              <Route path="scan" element={<ScanPage />} />
              <Route path="leaks" element={<LeaksPage />} />
              <Route path="what-if" element={<WhatIfPage />} />
              <Route path="afford" element={<AffordPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}
