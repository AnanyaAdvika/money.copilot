import { PageHeader } from '@/components/common/SummaryCard'
import { CATEGORY_CHART_COLORS } from '@/components/common/CategoryIcon'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import {
  averageDailySpending,
  categorySpending,
  dailySpending,
  filterByMonth,
  highestSpendingCategory,
  monthOverMonthChange,
  monthlyTrend,
  paymentMethodBreakdown,
  totalExpenses,
} from '@/lib/calculations'
import { formatINR, formatPercent, monthKey } from '@/lib/utils'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function AnalyticsPage() {
  const { transactions } = useApp()
  const month = monthKey()
  const monthTx = filterByMonth(transactions, month)
  const trend = monthlyTrend(transactions, 4)
  const byCat = Object.entries(categorySpending(monthTx)).map(([name, value]) => ({
    name,
    value,
  }))
  const methods = Object.entries(paymentMethodBreakdown(monthTx)).map(
    ([name, value]) => ({ name, value }),
  )
  const daily = dailySpending(transactions, month).filter(
    (d) => Number(d.date.slice(-2)) <= new Date().getDate(),
  )
  const avg = averageDailySpending(transactions, month)
  const top = highestSpendingCategory(monthTx)
  const mom = monthOverMonthChange(transactions)
  const foodMom = monthOverMonthChange(transactions, 'Food')

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Analytics"
        subtitle="Understand where your money goes — based on your actual transactions."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--color-ink-muted)]">This month spent</p>
            <p className="font-display text-2xl font-bold mt-1">
              {formatINR(totalExpenses(monthTx))}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--color-ink-muted)]">Avg daily spending</p>
            <p className="font-display text-2xl font-bold mt-1">{formatINR(avg)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--color-ink-muted)]">Highest category</p>
            <p className="font-display text-2xl font-bold mt-1">
              {top ? top.category : '—'}
            </p>
            {top && (
              <p className="text-xs text-[var(--color-ink-muted)]">{formatINR(top.amount)}</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[var(--color-ink-muted)]">Month-over-month</p>
            <p
              className={`font-display text-2xl font-bold mt-1 ${
                mom.percent > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatPercent(mom.percent)}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">vs last month</p>
          </CardBody>
        </Card>
      </div>

      {Math.abs(foodMom.percent) >= 5 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm">
          Food spending is{' '}
          <strong>
            {Math.round(Math.abs(foodMom.percent))}%{' '}
            {foodMom.percent > 0 ? 'higher' : 'lower'}
          </strong>{' '}
          than last month ({formatINR(foodMom.previous)} → {formatINR(foodMom.current)}).
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly spending</CardTitle>
          </CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Legend />
                <Bar dataKey="expenses" name="Expenses" fill="#e11d48" radius={[6, 6, 0, 0]} />
                <Bar dataKey="income" name="Income" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category breakdown</CardTitle>
          </CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byCat.map((e) => (
                    <Cell key={e.name} fill={CATEGORY_CHART_COLORS[e.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method breakdown</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {methods.length === 0 && (
              <p className="text-sm text-[var(--color-ink-muted)]">No data yet.</p>
            )}
            {methods
              .sort((a, b) => b.value - a.value)
              .map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{m.name}</span>
                  <span className="font-display font-semibold">{formatINR(m.value)}</span>
                </div>
              ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily spending</CardTitle>
          </CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => String(v).slice(-2)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 11 }} width={48} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
