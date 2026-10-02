import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Badge, EmptyState } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { monthlyRecurringTotal } from '@/lib/calculations'
import { formatINR } from '@/lib/utils'
import {
  CATEGORIES,
  type Category,
  type RecurringExpense,
  type RecurringFrequency,
} from '@/types'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export function RecurringPage() {
  const { recurring, addRecurring, deleteRecurring } = useApp()
  const { toast } = useToast()
  const total = monthlyRecurringTotal(recurring)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<RecurringExpense | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('Subscriptions')
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10))

  const upcoming = useMemo(
    () =>
      [...recurring].sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate)),
    [recurring],
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Recurring Expenses"
        subtitle="Subscriptions, rent, and anything that bills on a loop."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setName('')
              setAmount('')
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add Recurring
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-[var(--color-ink-muted)]">Monthly recurring cost</p>
            <p className="font-display text-3xl font-bold mt-1">{formatINR(total)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-[var(--color-ink-muted)]">Active recurring items</p>
            <p className="font-display text-3xl font-bold mt-1">{recurring.length}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              title="No recurring expenses"
              description="Add Netflix, hostel, gym, or any repeating bill."
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Recurring
                </Button>
              }
            />
          ) : (
            upcoming.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{r.name}</p>
                    <Badge tone="neutral">{r.frequency}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {r.category} · Next{' '}
                    {format(parseISO(r.nextPaymentDate), 'd MMM yyyy')}
                  </p>
                </div>
                <p className="font-display font-semibold shrink-0">
                  {formatINR(r.amount)}
                  <span className="text-xs font-normal text-[var(--color-ink-muted)]">
                    /{r.frequency === 'monthly' ? 'mo' : r.frequency === 'weekly' ? 'wk' : 'yr'}
                  </span>
                </p>
                <Button variant="ghost" size="icon" onClick={() => setDeleting(r)}>
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Recurring Expense">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const amt = Number(amount)
            if (!name.trim() || !amt) return
            addRecurring({
              name: name.trim(),
              amount: amt,
              category,
              frequency,
              nextPaymentDate: nextDate,
              paymentMethod: 'UPI',
            })
            toast('Recurring expense added.')
            setOpen(false)
          }}
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix" />
          <Input
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
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
          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <Input
            label="Next payment date"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete recurring expense?"
        message="This recurring item will be removed from your list."
        onConfirm={() => {
          if (deleting) {
            deleteRecurring(deleting.id)
            toast('Recurring expense deleted.')
          }
        }}
      />
    </div>
  )
}
