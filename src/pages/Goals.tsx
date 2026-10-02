import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { EmptyState, ProgressBar } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import {
  estimatedGoalCompletion,
  filterByMonth,
  monthlySavings,
} from '@/lib/calculations'
import { formatINR, monthKey } from '@/lib/utils'
import type { SavingsGoal } from '@/types'
import { format } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function GoalsPage() {
  const { goals, transactions, addGoal, updateGoal, deleteGoal, addToGoal } = useApp()
  const { toast } = useToast()
  const savings = monthlySavings(filterByMonth(transactions, monthKey()))
  const [open, setOpen] = useState(false)
  const [addMoneyOpen, setAddMoneyOpen] = useState<SavingsGoal | null>(null)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [addAmount, setAddAmount] = useState('')

  const openCreate = () => {
    setEditing(null)
    setName('')
    setTarget('')
    setSaved('0')
    setEmoji('🎯')
    setOpen(true)
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Savings Goals"
        subtitle="Track what you're saving for — and how close you are."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            title="No savings goals"
            description="Create a goal like headphones, a trip, or an emergency fund."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0
            const remaining = Math.max(0, g.target - g.saved)
            const est = estimatedGoalCompletion(g, Math.max(0, savings))
            return (
              <Card key={g.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{g.emoji || '🎯'}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-lg truncate">
                        {g.name}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {Math.round(pct)}% complete
                      </p>
                    </div>
                  </div>
                  <ProgressBar
                    percent={pct}
                    status={pct >= 100 ? 'exceeded' : pct >= 75 ? 'approaching' : 'normal'}
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Saved</p>
                      <p className="font-semibold">{formatINR(g.saved)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Target</p>
                      <p className="font-semibold">{formatINR(g.target)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Remaining</p>
                      <p className="font-semibold">{formatINR(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-ink-muted)]">Est. completion</p>
                      <p className="font-semibold text-xs">
                        {est.date
                          ? format(est.date, 'd MMM yyyy')
                          : 'Need positive savings rate'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setAddMoneyOpen(g)
                        setAddAmount('')
                      }}
                    >
                      Add money
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(g)
                        setName(g.name)
                        setTarget(String(g.target))
                        setSaved(String(g.saved))
                        setEmoji(g.emoji || '🎯')
                        setOpen(true)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(g)}>
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
        title={editing ? 'Edit Goal' : 'Create Savings Goal'}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const t = Number(target)
            const s = Number(saved) || 0
            if (!name.trim() || !t) return
            if (editing) {
              updateGoal(editing.id, {
                name: name.trim(),
                target: t,
                saved: s,
                emoji,
              })
              toast('Goal updated.')
            } else {
              addGoal({ name: name.trim(), target: t, saved: s, emoji })
              toast('Goal created.')
            }
            setOpen(false)
          }}
        >
          <Input label="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          <Input
            label="Goal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Headphones"
          />
          <Input
            label="Target (₹)"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <Input
            label="Already saved (₹)"
            type="number"
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!addMoneyOpen}
        onClose={() => setAddMoneyOpen(null)}
        title={`Add money to ${addMoneyOpen?.name || ''}`}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const amt = Number(addAmount)
            if (!addMoneyOpen || !amt) return
            addToGoal(addMoneyOpen.id, amt)
            toast(`Added ${formatINR(amt)} to ${addMoneyOpen.name}.`)
            setAddMoneyOpen(null)
          }}
        >
          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddMoneyOpen(null)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete goal?"
        message="This savings goal will be permanently removed."
        onConfirm={() => {
          if (deleting) {
            deleteGoal(deleting.id)
            toast('Goal deleted.')
          }
        }}
      />
    </div>
  )
}
