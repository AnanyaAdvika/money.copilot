import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { CATEGORIES, PAYMENT_METHODS, type Category, type PaymentMethod, type Transaction, type TransactionType } from '@/types'
import { useState } from 'react'

export type TransactionFormValues = {
  amount: string
  type: TransactionType
  category: Category
  merchant: string
  date: string
  paymentMethod: PaymentMethod
  notes: string
}

const empty = (): TransactionFormValues => ({
  amount: '',
  type: 'expense',
  category: 'Food',
  merchant: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'UPI',
  notes: '',
})

export function TransactionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Transaction',
}: {
  initial?: Partial<Transaction>
  onSubmit: (data: Omit<Transaction, 'id'>) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const [form, setForm] = useState<TransactionFormValues>({
    ...empty(),
    ...(initial
      ? {
          amount: String(initial.amount ?? ''),
          type: initial.type ?? 'expense',
          category: initial.category ?? 'Food',
          merchant: initial.merchant ?? '',
          date: initial.date ?? new Date().toISOString().slice(0, 10),
          paymentMethod: initial.paymentMethod ?? 'UPI',
          notes: initial.notes ?? '',
        }
      : {}),
  })
  const [error, setError] = useState('')

  const set = <K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K],
  ) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.merchant.trim()) {
      setError('Merchant / description is required.')
      return
    }
    if (!amount || amount <= 0) {
      setError('Enter a valid amount greater than 0.')
      return
    }
    setError('')
    onSubmit({
      amount,
      type: form.type,
      category: form.type === 'income' ? 'Income' : form.category,
      merchant: form.merchant.trim(),
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
              form.type === t
                ? t === 'income'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-rose-600 text-white shadow'
                : 'text-[var(--color-ink-muted)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Input
        label="Amount (₹)"
        type="number"
        min="1"
        step="1"
        placeholder="e.g. 438"
        value={form.amount}
        onChange={(e) => set('amount', e.target.value)}
        error={error.includes('amount') ? error : undefined}
      />

      <Input
        label="Merchant / Description"
        placeholder="e.g. Swiggy"
        value={form.merchant}
        onChange={(e) => set('merchant', e.target.value)}
      />

      {form.type === 'expense' && (
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => set('category', e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
        <Select
          label="Payment Method"
          value={form.paymentMethod}
          onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Notes (optional)"
        placeholder="Any extra details..."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
      />

      {error && !error.includes('amount') && (
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
