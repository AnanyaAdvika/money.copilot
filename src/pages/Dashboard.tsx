import { SummaryCard, PageHeader } from '@/components/common/SummaryCard'
import { CATEGORY_CHART_COLORS } from '@/components/common/CategoryIcon'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import {
  averageDailySpending,
  categorySpending,
  currentBalance,
  dailySpending,
  filterByMonth,
  generateSmartInsights,
  monthlySavings,
  totalExpenses,
  totalIncome,
} from '@/lib/calculations'
import { formatINR, getDaysUntil, greeting, monthKey } from '@/lib/utils'
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  ScanLine,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DashboardPage() {
  const { transactions, budgets, recurring, settings, goals } = useApp()
  const month = monthKey()
  const monthTx = filterByMonth(transactions, month)
  const balance = currentBalance(transactions)
  const income = totalIncome(monthTx)
  const expenses = totalExpenses(monthTx)
  const savings = monthlySavings(monthTx)
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
  const daily = dailySpending(transactions, month).filter((d) => {
    const day = Number(d.date.slice(-2))
    return day <= new Date().getDate()
  })
  const byCat = Object.entries(categorySpending(monthTx)).map(([name, value]) => ({
    name,
    value,
  }))
  const insights = generateSmartInsights(transactions, budgets, recurring)
  const avgDaily = averageDailySpending(transactions, month)
  const sm = settings.studentMode

  const daysLeft = getDaysUntil(sm.allowanceDay)
  const remainingAllowance = sm.monthlyAllowance - expenses
  const suggestedDaily =
    daysLeft > 0 ? Math.max(0, Math.round(remainingAllowance / daysLeft)) : 0

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={`${greeting()} 👋`}
        subtitle={`Hey ${settings.userName} — here's how your money is looking this month.`}
        actions={
          <div className="flex gap-2">
            <Link to="/scan">
              <Button variant="accent" size="sm">
                <ScanLine className="h-4 w-4" /> Scan Receipt
              </Button>
            </Link>
            <Link to="/copilot">
              <Button variant="secondary" size="sm">
                <Sparkles className="h-4 w-4" /> Copilot
              </Button>
            </Link>
          </div>
        }
      />

      {settings.demoDataLoaded && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <span>
            You're viewing <strong>demo data</strong> for a fictional student. Explore freely —
            clear it anytime in Settings.
          </span>
          <Badge tone="warning">Demo</Badge>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Balance" value={balance} icon={Wallet} tone="default" />
        <SummaryCard title="Income" value={income} icon={ArrowUpRight} tone="income" subtitle="This month" />
        <SummaryCard title="Expenses" value={expenses} icon={ArrowDownRight} tone="expense" subtitle="This month" />
        <SummaryCard title="Savings" value={savings} icon={PiggyBank} tone="savings" subtitle="Income − Expenses" />
      </div>

      {sm.enabled && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-teal-100 text-sm font-medium">Student Mode</p>
                <h3 className="font-display text-xl font-bold mt-1">Monthly Allowance Tracker</h3>
                <p className="text-teal-100/80 text-xs mt-1">
                  Calculation based on remaining money — not financial advice.
                </p>
              </div>
              <Badge tone="primary">{daysLeft} days to next allowance</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-teal-200 text-xs">Allowance</p>
                <p className="font-display text-xl font-bold">{formatINR(sm.monthlyAllowance)}</p>
              </div>
              <div>
                <p className="text-teal-200 text-xs">Spent</p>
                <p className="font-display text-xl font-bold">{formatINR(expenses)}</p>
              </div>
              <div>
                <p className="text-teal-200 text-xs">Remaining</p>
                <p className="font-display text-xl font-bold">{formatINR(remainingAllowance)}</p>
              </div>
              <div>
                <p className="text-teal-200 text-xs">Suggested daily</p>
                <p className="font-display text-xl font-bold">{formatINR(suggestedDaily)}/day</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <span className="text-xs text-[var(--color-ink-muted)]">
              Avg {formatINR(avgDaily)}/day
            </span>
          </CardHeader>
          <CardBody className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => String(v).slice(-2)}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `₹${v}`}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(v) => [formatINR(Number(v)), 'Spent']}
                  labelFormatter={(l) => String(l)}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0f766e"
                  fill="url(#spendFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardBody className="h-64">
            {byCat.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-muted)] text-center pt-16">
                No spending yet this month.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCat}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {byCat.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_CHART_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatINR(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/transactions" className="text-sm font-medium text-[var(--color-primary)]">
              View all transactions
            </Link>
          </CardHeader>
          <CardBody className="space-y-1">
            {recent.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Smart Insights</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {insights.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              >
                {i.message}
              </div>
            ))}
            {goals[0] && (
              <div className="rounded-xl bg-[var(--color-primary-soft)] px-3 py-2.5 text-sm text-[var(--color-primary)]">
                Goal in focus: {goals[0].emoji} {goals[0].name} —{' '}
                {Math.round((goals[0].saved / goals[0].target) * 100)}% there.
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/leaks">
                <Button variant="outline" size="sm" className="w-full">
                  Money Leaks
                </Button>
              </Link>
              <Link to="/afford">
                <Button variant="outline" size="sm" className="w-full">
                  Can I Afford?
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
