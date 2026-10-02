import type { Category } from '@/types'
import {
  Bus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  Plane,
  Repeat,
  ShoppingBag,
  Utensils,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryMeta: Record<
  Category,
  { icon: typeof Utensils; color: string; bg: string }
> = {
  Food: { icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950' },
  Transport: { icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950' },
  Shopping: {
    icon: ShoppingBag,
    color: 'text-pink-600',
    bg: 'bg-pink-100 dark:bg-pink-950',
  },
  Education: {
    icon: GraduationCap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100 dark:bg-indigo-950',
  },
  Entertainment: {
    icon: Clapperboard,
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-950',
  },
  Health: {
    icon: HeartPulse,
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-950',
  },
  'Hostel/Rent': {
    icon: Home,
    color: 'text-amber-700',
    bg: 'bg-amber-100 dark:bg-amber-950',
  },
  Subscriptions: {
    icon: Repeat,
    color: 'text-cyan-700',
    bg: 'bg-cyan-100 dark:bg-cyan-950',
  },
  Travel: { icon: Plane, color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-950' },
  Other: {
    icon: MoreHorizontal,
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
  Income: {
    icon: Wallet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-950',
  },
}

export function CategoryIcon({
  category,
  size = 'md',
}: {
  category: Category
  size?: 'sm' | 'md'
}) {
  const meta = categoryMeta[category] || categoryMeta.Other
  const Icon = meta.icon
  return (
    <div
      className={cn(
        'grid place-items-center rounded-xl',
        meta.bg,
        meta.color,
        size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
      )}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </div>
  )
}

export const CATEGORY_CHART_COLORS: Record<string, string> = {
  Food: '#ea580c',
  Transport: '#2563eb',
  Shopping: '#db2777',
  Education: '#4f46e5',
  Entertainment: '#7c3aed',
  Health: '#e11d48',
  'Hostel/Rent': '#b45309',
  Subscriptions: '#0e7490',
  Travel: '#0284c7',
  Other: '#64748b',
}
