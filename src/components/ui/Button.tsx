import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm shadow-teal-900/10',
  secondary:
    'bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:opacity-90',
  ghost:
    'bg-transparent text-[var(--color-ink)] hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
  outline:
    'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-black/[0.02] dark:hover:bg-white/5',
  accent:
    'bg-[var(--color-accent)] text-white hover:opacity-90 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-xl grid place-items-center',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
