import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-fade-up flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 shadow-lg',
            t.type === 'success' && 'border-emerald-200 dark:border-emerald-900',
            t.type === 'error' && 'border-rose-200 dark:border-rose-900',
          )}
        >
          {t.type === 'success' && (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          )}
          {t.type === 'error' && (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          {t.type === 'info' && (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
          )}
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
