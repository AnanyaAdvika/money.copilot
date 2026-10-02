import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { calculateAffordability } from '@/lib/affordability'
import { formatINR } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/types'
import { CircleDollarSign } from 'lucide-react'
import { useMemo, useState } from 'react'

export function AffordPage() {
  const { transactions, recurring, budgets, goals, addTransaction } = useApp()
  const { toast } = useToast()
  const [name, setName] = useState('Nike Shoes')
  const [amount, setAmount] = useState('2499')
  const [category, setCategory] = useState<Category>('Shopping')
  const [analyzed, setAnalyzed] = useState(false)

  const result = useMemo(() => {
    if (!analyzed) return null
    const amt = Number(amount)
    if (!amt || amt <= 0) return null
    return calculateAffordability(
      name || 'Purchase',
      amt,
      transactions,
      recurring,
      budgets,
      goals,
      category,
    )
  }, [analyzed, amount, name, transactions, recurring, budgets, goals, category])

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <PageHeader
        title="Can I Afford This?"
        subtitle="See what a purchase would change — without being told what to buy."
      />

      <Card>
        <CardBody className="space-y-4">
          <Input
            label="Purchase"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setAnalyzed(false)
            }}
            placeholder="Nike Shoes"
          />
          <Input
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setAnalyzed(false)
            }}
            placeholder="2499"
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as Category)
              setAnalyzed(false)
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Button className="w-full" onClick={() => setAnalyzed(true)}>
            <CircleDollarSign className="h-4 w-4" /> Analyze purchase
          </Button>
        </CardBody>
      </Card>

      {result && (
        <Card className="overflow-hidden animate-fade-up">
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white p-5">
            <p className="text-orange-100 text-sm">{result.summary}</p>
            <h2 className="font-display text-2xl font-bold mt-1">
              {result.purchaseName} — {formatINR(result.purchaseAmount)}
            </h2>
          </div>
          <CardBody className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Current balance', result.balance],
                ['This month income', result.monthIncome],
                ['This month expenses', result.monthExpenses],
                ['Upcoming commitments', result.upcomingCommitments],
                ['Available after commitments', result.availableAfterCommitments],
                ['After purchase', result.afterPurchase],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-[var(--color-border)] px-3 py-2.5"
                >
                  <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
                  <p
                    className={`font-display font-bold text-lg ${
                      label === 'After purchase' && Number(value) < 0
                        ? 'text-rose-600'
                        : ''
                    }`}
                  >
                    {formatINR(Number(value))}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm">
              <p>
                Remaining safe-to-spend estimate:{' '}
                <strong>{formatINR(result.safeToSpend)}</strong>
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                Based on balance, recurring commitments, and this month's cash flow. Not
                financial advice.
              </p>
            </div>

            {result.goalImpact && result.goalImpact.extraDays > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900 px-4 py-3 text-sm">
                Savings goal impact: <strong>{result.goalImpact.goalName}</strong> may take
                approximately <strong>{result.goalImpact.extraDays} additional days</strong>{' '}
                based on current savings rate.
              </div>
            )}

            {result.budgetImpacts.some((b) => b.wouldExceed) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm">
                This purchase would push your{' '}
                {result.budgetImpacts
                  .filter((b) => b.wouldExceed)
                  .map((b) => b.category)
                  .join(', ')}{' '}
                budget over the limit.
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  addTransaction({
                    amount: result.purchaseAmount,
                    type: 'expense',
                    category,
                    merchant: `${result.purchaseName} (planned)`,
                    date: new Date().toISOString().slice(0, 10),
                    paymentMethod: 'UPI',
                    notes: 'Planned expense from Can I Afford This?',
                  })
                  toast('Added to planned expenses.')
                }}
              >
                Add to planned expenses
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  addTransaction({
                    amount: result.purchaseAmount,
                    type: 'expense',
                    category,
                    merchant: result.purchaseName,
                    date: new Date().toISOString().slice(0, 10),
                    paymentMethod: 'UPI',
                    notes: 'Added via Can I Afford This?',
                  })
                  toast('Expense added successfully.')
                }}
              >
                Add anyway
              </Button>
              <Button variant="ghost" onClick={() => setAnalyzed(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
