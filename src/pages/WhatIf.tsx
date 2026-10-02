import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import {
  filterByMonth,
  monthlySavings,
} from '@/lib/calculations'
import {
  calculateWhatIf,
  projectionSeries,
  WHAT_IF_PRESETS,
  type WhatIfResult,
} from '@/lib/whatIf'
import { formatINR, monthKey } from '@/lib/utils'
import type { Category, WhatIfScenario } from '@/types'
import { CATEGORIES } from '@/types'
import { FlaskConical } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function WhatIfPage() {
  const { transactions, goals } = useApp()
  const currentSavings = monthlySavings(filterByMonth(transactions, monthKey()))

  const [mode, setMode] = useState<WhatIfScenario['type']>('reduce_weekly')
  const [amount, setAmount] = useState(500)
  const [category, setCategory] = useState<Category>('Food')

  const scenario: WhatIfScenario = useMemo(() => {
    switch (mode) {
      case 'reduce_weekly':
        return { type: 'reduce_weekly', category, amount }
      case 'save_monthly':
        return { type: 'save_monthly', amount }
      case 'cancel_subscription':
        return { type: 'cancel_subscription', amount }
      case 'income_increase':
        return { type: 'income_increase', amount }
    }
  }, [mode, amount, category])

  const result: WhatIfResult = useMemo(
    () => calculateWhatIf(currentSavings, scenario, goals),
    [currentSavings, scenario, goals],
  )

  const chart = useMemo(
    () =>
      projectionSeries(
        result.currentMonthlySavings,
        result.projectedMonthlySavings,
        12,
      ),
    [result],
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="What if I…"
        subtitle="Explore mathematical consequences of different scenarios — not financial advice."
      />

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-orange-500" /> Scenario builder
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {WHAT_IF_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMode(p.scenario.type)
                    if ('amount' in p.scenario) setAmount(p.scenario.amount)
                    if (p.scenario.type === 'reduce_weekly')
                      setCategory(p.scenario.category)
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <Select
              label="Scenario type"
              value={mode}
              onChange={(e) => setMode(e.target.value as WhatIfScenario['type'])}
            >
              <option value="reduce_weekly">Reduce weekly spending</option>
              <option value="save_monthly">Save more monthly</option>
              <option value="cancel_subscription">Cancel a subscription</option>
              <option value="income_increase">Income increase</option>
            </Select>

            {mode === 'reduce_weekly' && (
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-ink-muted)]">Amount (₹)</span>
                <span className="font-display font-semibold">{formatINR(amount)}</span>
              </div>
              <input
                type="range"
                min={100}
                max={mode === 'income_increase' ? 20000 : 5000}
                step={50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-teal-700"
              />
              <Input
                className="mt-2"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3 overflow-hidden">
          <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6">
            <p className="text-teal-100 text-sm">{result.scenarioLabel}</p>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-teal-200 text-xs">Current monthly savings</p>
                <p className="font-display text-2xl font-bold">
                  {formatINR(result.currentMonthlySavings)}
                </p>
              </div>
              <div>
                <p className="text-teal-200 text-xs">Projected monthly savings</p>
                <p className="font-display text-2xl font-bold">
                  {formatINR(result.projectedMonthlySavings)}
                </p>
              </div>
              <div>
                <p className="text-teal-200 text-xs">Projected annual difference</p>
                <p className="font-display text-2xl font-bold text-orange-300">
                  {formatINR(result.annualDifference)}
                </p>
              </div>
            </div>
            {result.goalImpact && result.goalImpact.daysEarlier > 0 && (
              <p className="mt-4 text-sm text-teal-100 rounded-xl bg-white/10 px-3 py-2">
                Your goal <strong>{result.goalImpact.goalName}</strong> could be reached
                approximately{' '}
                <strong>
                  {result.goalImpact.daysEarlier >= 30
                    ? `${Math.round(result.goalImpact.daysEarlier / 30)} months`
                    : `${result.goalImpact.daysEarlier} days`}
                </strong>{' '}
                earlier.
              </p>
            )}
          </div>
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(v) => `M${v}`} />
                <YAxis tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}k`} width={44} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current path"
                  stroke="#64748b"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="What-if path"
                  stroke="#ea580c"
                  fill="url(#proj)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
