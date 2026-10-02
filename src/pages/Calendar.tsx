import { PageHeader } from '@/components/common/SummaryCard'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { totalExpenses, totalIncome } from '@/lib/calculations'
import { cn, formatINR } from '@/lib/utils'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

export function CalendarPage() {
  const { transactions } = useApp()
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const txByDate = useMemo(() => {
    const map = new Map<string, typeof transactions>()
    for (const t of transactions) {
      if (!map.has(t.date)) map.set(t.date, [])
      map.get(t.date)!.push(t)
    }
    return map
  }, [transactions])

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const dayTx = txByDate.get(selectedKey) || []
  const daySpend = totalExpenses(dayTx)
  const dayIncome = totalIncome(dayTx)

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Calendar"
        subtitle="See spending patterns day by day."
      />

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor((d) => addMonths(d, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{format(cursor, 'MMMM yyyy')}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor((d) => addMonths(d, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-semibold uppercase text-[var(--color-ink-muted)] py-1"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const hasTx = (txByDate.get(key) || []).length > 0
                const inMonth = isSameMonth(day, cursor)
                const isSelected = isSameDay(day, selected)
                const isToday = isSameDay(day, new Date())
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(day)}
                    className={cn(
                      'relative aspect-square rounded-xl text-sm font-medium transition flex flex-col items-center justify-center',
                      !inMonth && 'opacity-30',
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white shadow'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5',
                      isToday && !isSelected && 'ring-2 ring-teal-500/40',
                    )}
                  >
                    {format(day, 'd')}
                    {hasTx && (
                      <span
                        className={cn(
                          'absolute bottom-1.5 h-1.5 w-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-orange-500',
                        )}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{format(selected, 'd MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3">
                <p className="text-xs text-rose-700 dark:text-rose-300">Spent</p>
                <p className="font-display font-bold text-lg">{formatINR(daySpend)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Income</p>
                <p className="font-display font-bold text-lg">{formatINR(dayIncome)}</p>
              </div>
            </div>
            <div className="space-y-1">
              {dayTx.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)] py-6 text-center">
                  No transactions on this day.
                </p>
              ) : (
                dayTx
                  .sort((a, b) => b.type.localeCompare(a.type))
                  .map((t) => <TransactionItem key={t.id} transaction={t} />)
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
