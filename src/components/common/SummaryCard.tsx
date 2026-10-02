import { cn, formatINR } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'default',
  className,
}: {
  title: string
  value: number
  subtitle?: string
  icon: LucideIcon
  tone?: 'default' | 'income' | 'expense' | 'savings'
  className?: string
}) {
  const tones = {
    default: 'from-teal-500/10 to-transparent text-teal-700 dark:text-teal-300',
    income: 'from-emerald-500/10 to-transparent text-emerald-700 dark:text-emerald-300',
    expense: 'from-rose-500/10 to-transparent text-rose-700 dark:text-rose-300',
    savings: 'from-orange-500/10 to-transparent text-orange-700 dark:text-orange-300',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
          tones[tone],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-ink-muted)]">{title}</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight">
            {formatINR(value)}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl bg-white/70 dark:bg-white/5',
            tones[tone].split(' ').slice(-2).join(' '),
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
