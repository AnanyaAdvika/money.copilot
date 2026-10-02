import { PageHeader } from '@/components/common/SummaryCard'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { downloadCSV, exportTransactionsCSV } from '@/lib/calculations'
import { CATEGORIES, PAYMENT_METHODS, type Transaction } from '@/types'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export function TransactionsPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useApp()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [sort, setSort] = useState('date-desc')

  const filtered = useMemo(() => {
    let list = [...transactions]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          String(t.amount).includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q),
      )
    }
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all')
      list = list.filter((t) => t.category === categoryFilter)
    if (methodFilter !== 'all')
      list = list.filter((t) => t.paymentMethod === methodFilter)

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return a.date.localeCompare(b.date)
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        default:
          return b.date.localeCompare(a.date)
      }
    })
    return list
  }, [transactions, search, typeFilter, categoryFilter, methodFilter, sort])

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Transactions"
        subtitle="Add, search, filter, and manage every rupee."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadCSV(
                  exportTransactionsCSV(transactions),
                  `money-copilot-${new Date().toISOString().slice(0, 10)}.csv`,
                )
                toast('CSV exported successfully.')
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Income">Income</option>
          </Select>
          <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="all">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Amount high → low</option>
            <option value="amount-asc">Amount low → high</option>
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-1">
          {filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Try adjusting filters or add your first transaction."
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Transaction
                </Button>
              }
            />
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="group flex items-center gap-1">
                <div className="flex-1 min-w-0">
                  <TransactionItem
                    transaction={t}
                    onClick={() => {
                      setEditing(t)
                      setOpen(true)
                    }}
                  />
                </div>
                <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition gap-1 pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(t)
                      setOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(t)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          initial={editing || undefined}
          submitLabel={editing ? 'Update Transaction' : 'Add Transaction'}
          onCancel={() => setOpen(false)}
          onSubmit={(data) => {
            if (editing) {
              updateTransaction(editing.id, data)
              toast('Transaction updated.')
            } else {
              addTransaction(data)
              toast(
                data.type === 'income'
                  ? 'Income added successfully.'
                  : 'Expense added successfully.',
              )
            }
            setOpen(false)
            setEditing(null)
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete transaction?"
        message="This cannot be undone. The transaction will be removed from your history."
        onConfirm={() => {
          if (deleting) {
            deleteTransaction(deleting.id)
            toast('Transaction deleted.')
          }
        }}
      />
    </div>
  )
}
