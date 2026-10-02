import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Badge, EmptyState, ProgressBar } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { budgetProgress } from '@/lib/calculations'
import { formatINR, monthKey } from '@/lib/utils'
import { CATEGORIES, type Budget, type Category } from '@/types'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function BudgetsPage() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useApp()
  const { toast } = useToast()
  const month = monthKey()
  const monthBudgets = budgets.filter((b) => b.month === month)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const [category, setCategory] = useState<Category>('Food')
  const [amount, setAmount] = useState('')

  const statusTone = {
    normal: 'success' as const,
    approaching: 'warning' as const,
    near: 'warning' as const,
    exceeded: 'danger' as const,
  }

  const statusLabel = {
    normal: 'On track',
    approaching: 'Approaching limit',
    near: 'Near limit',
    exceeded: 'Exceeded',
  }

  const openCreate = () => {
    setEditing(null)
    setCategory('Food')
    setAmount('')
    setOpen(true)
  }

  const openEdit = (b: Budget) => {
    setEditing(b)
    setCategory(b.category)
    setAmount(String(b.amount))
    setOpen(true)
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Budgets"
        subtitle="Set category limits and track progress through the month."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Budget
          </Button>
        }
      />

      {monthBudgets.length === 0 ? (
        <Card>
          <EmptyState
            title="No budgets yet"
            description="Create a category budget to start tracking spending limits."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {monthBudgets.map((b) => {
            const p = budgetProgress(b, transactions)
            return (
              <Card key={b.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{b.category}</h3>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                        You've used {Math.round(p.percent)}% of your {b.category} budget.
                      </p>
                    </div>
                    <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                  </div>
                  <ProgressBar percent={p.percent} status={p.status} />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[var(--color-ink-muted)] text-xs">Budget</p>
                      <p className="font-semibold">{formatINR(b.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] text-xs">Spent</p>
                      <p className="font-semibold">{formatINR(p.spent)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] text-xs">Remaining</p>
                      <p
                        className={`font-semibold ${
                          p.remaining < 0 ? 'text-rose-600' : ''
                        }`}
                      >
                        {formatINR(p.remaining)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(b)}>
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Budget' : 'Create Budget'}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const amt = Number(amount)
            if (!amt || amt <= 0) return
            if (editing) {
              updateBudget(editing.id, { category, amount: amt })
              toast('Budget updated.')
            } else {
              addBudget({ category, amount: amt, month })
              toast('Budget created.')
            }
            setOpen(false)
          }}
        >
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
          <Input
            label="Monthly limit (₹)"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 3000"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete budget?"
        message="This budget will be removed. Your transactions will stay intact."
        onConfirm={() => {
          if (deleting) {
            deleteBudget(deleting.id)
            toast('Budget deleted.')
          }
        }}
      />
    </div>
  )
}
