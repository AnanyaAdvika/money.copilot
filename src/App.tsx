import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Onboarding } from '@/components/Onboarding'
import { LoginPage, SignupPage } from '@/pages/Auth'
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
import { useEffect, useState, type ReactNode } from 'react'

const pages = <>
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
</>

function ProtectedLayout() {
  const { currentUser, ready } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    setShowOnboarding(Boolean(currentUser && !localStorage.getItem(`moneyCopilot_onboarding_${currentUser.id}`)))
  }, [currentUser?.id])
  if (!ready) return <Loading />
  if (!currentUser) return <Navigate to="/login" replace />
  return <AppProvider><AppLayout />{showOnboarding && <Onboarding userId={currentUser.id} onDone={() => setShowOnboarding(false)} />}</AppProvider>
}

function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, ready } = useAuth()
  if (!ready) return <Loading />
  return currentUser ? <Navigate to="/" replace /> : children
}

function Loading() {
  return <div className="min-h-screen grid place-items-center"><div className="h-10 w-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" /></div>
}

export default function App() {
  return <AuthProvider><ToastProvider><BrowserRouter><Routes>
    <Route path="/login" element={<AuthGate><LoginPage /></AuthGate>} />
    <Route path="/signup" element={<AuthGate><SignupPage /></AuthGate>} />
    <Route element={<ProtectedLayout />}>{pages}</Route>
  </Routes></BrowserRouter></ToastProvider></AuthProvider>
}
