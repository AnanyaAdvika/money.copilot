import { PageHeader } from '@/components/common/SummaryCard'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { detectMoneyLeaks } from '@/lib/moneyLeaks'
import { formatINR, formatPercent } from '@/lib/utils'
import type { MoneyLeakInsight, Transaction } from '@/types'
import { Droplets } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export function LeaksPage() {
  const { transactions } = useApp()
  const leaks = useMemo(() => detectMoneyLeaks(transactions), [transactions])
  const [selected, setSelected] = useState<MoneyLeakInsight | null>(null)

  const related: Transaction[] = useMemo(() => {
    if (!selected) return []
    const set = new Set(selected.transactionIds)
    return transactions.filter((t) => set.has(t.id))
  }, [selected, transactions])

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Money Leak Detector"
        subtitle="Pattern detected from your history — neutral insights, not judgment."
      />

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 sm:p-6 flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <Droplets className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Spending patterns worth a look</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              We flag unusual frequency, category increases, micro-spending, and repeated
              merchants. Potential areas to review — you decide what matters.
            </p>
          </div>
        </div>
      </Card>

      {leaks.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
            No notable patterns detected yet. Add more transactions to unlock insights.
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {leaks.map((leak) => (
            <Card key={leak.id} className="hover:shadow-md transition">
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-lg">{leak.title}</h3>
                  <Badge tone="warning">Pattern detected</Badge>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)]">{leak.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {leak.amount != null && (
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Total</p>
                      <p className="font-semibold">{formatINR(leak.amount)}</p>
                    </div>
                  )}
                  {leak.previousAmount != null && leak.previousAmount > 0 && (
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Previous</p>
                      <p className="font-semibold">{formatINR(leak.previousAmount)}</p>
                    </div>
                  )}
                  {leak.changePercent != null && (
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Change</p>
                      <p className="font-semibold text-orange-600">
                        {formatPercent(leak.changePercent)}
                      </p>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelected(leak)}>
                  See transactions
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--color-ink-muted)] text-center">
        Want to model a change? Try the{' '}
        <Link to="/what-if" className="text-[var(--color-primary)] font-medium">
          What-If Simulator
        </Link>
        .
      </p>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Transactions'}
        wide
      >
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          {selected?.description}
        </p>
        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          {related.map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      </Modal>
    </div>
  )
}
