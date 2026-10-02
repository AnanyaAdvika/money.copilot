import { CategoryIcon } from '@/components/common/CategoryIcon'
import { Badge } from '@/components/ui/ProgressBar'
import type { Transaction } from '@/types'
import { formatINR } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

export function TransactionItem({
  transaction,
  onClick,
}: {
  transaction: Transaction
  onClick?: () => void
}) {
  const isIncome = transaction.type === 'income'
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
    >
      <CategoryIcon category={transaction.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-sm">{transaction.merchant}</p>
          {transaction.isDemo && <Badge tone="neutral">Demo</Badge>}
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] truncate">
          {format(parseISO(transaction.date), 'd MMM yyyy')} · {transaction.paymentMethod} ·{' '}
          {transaction.category}
        </p>
      </div>
      <p
        className={`shrink-0 font-display font-semibold text-sm ${
          isIncome ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatINR(transaction.amount)}
      </p>
    </button>
  )
}
