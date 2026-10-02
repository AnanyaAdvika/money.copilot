import { cn } from '@/lib/utils'

export function ProgressBar({
  percent,
  status = 'normal',
  className,
}: {
  percent: number
  status?: 'normal' | 'approaching' | 'near' | 'exceeded'
  className?: string
}) {
  const colors = {
    normal: 'bg-[var(--color-primary)]',
    approaching: 'bg-amber-500',
    near: 'bg-orange-500',
    exceeded: 'bg-[var(--color-danger)]',
  }

  return (
    <div
      className={cn(
        'h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[status])}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-primary-soft)] text-2xl">
        📭
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--color-ink-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    primary: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
