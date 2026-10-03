import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Target,
  Repeat,
  CalendarDays,
  Sparkles,
  Settings,
  ScanLine,
  Droplets,
  FlaskConical,
  CircleDollarSign,
  Moon,
  Sun,
  Search,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { ToastViewport } from '@/components/ui/Toast'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/goals', label: 'Savings Goals', icon: Target },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/copilot', label: 'Money Copilot', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const mobileNav = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/copilot', label: 'Copilot', icon: Sparkles },
  { to: '/settings', label: 'More', icon: Settings },
]

const featureShortcuts = [
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/leaks', label: 'Leaks', icon: Droplets },
  { to: '/what-if', label: 'What-If', icon: FlaskConical },
  { to: '/afford', label: 'Afford?', icon: CircleDollarSign },
]

export function AppLayout() {
  const { settings, updateSettings, transactions, ready } = useApp()
  const { currentUser, logout } = useAuth()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return transactions
      .filter((t) => {
        return (
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          String(t.amount).includes(q) ||
          `₹${t.amount}`.includes(q) ||
          t.date.includes(q) ||
          (t.notes || '').toLowerCase().includes(q) ||
          new Date(t.date)
            .toLocaleString('en-IN', { month: 'long' })
            .toLowerCase()
            .includes(q)
        )
      })
      .slice(0, 8)
  }, [query, transactions])

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--color-ink-muted)]">Loading Money Copilot…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur sticky top-0 h-screen">
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-display font-bold shadow-lg shadow-teal-900/20">
              ₹
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Money Copilot</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Student money OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-slate-50 hover:text-[var(--color-ink)] dark:hover:bg-white/5',
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}

          <p className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            Signature Features
          </p>
          {featureShortcuts.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-slate-50 dark:hover:bg-white/5',
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col pb-24 md:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-700 text-white text-sm font-bold">
                ₹
              </div>
              <span className="font-display font-bold">Money Copilot</span>
            </div>

            <div className="relative flex-1 max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Swiggy, ₹500, Food…"
                className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              {query && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl overflow-hidden z-40">
                  {searchResults.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                      onClick={() => {
                        setQuery('')
                        navigate('/transactions')
                      }}
                    >
                      <span className="truncate">{t.merchant}</span>
                      <span className="text-[var(--color-ink-muted)]">₹{t.amount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
              aria-label="Toggle dark mode"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around py-2">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium',
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-muted)]',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <ToastViewport />
    </div>
  )
}
