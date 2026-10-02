import type {
  Transaction,
  Budget,
  Category,
  PaymentMethod,
  RecurringExpense,
  SavingsGoal,
  SmartInsight,
} from '@/types'
import { monthKey, daysInMonth, parseMonthKey } from '@/lib/utils'

export function filterByMonth(
  transactions: Transaction[],
  month: string,
): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === month)
}

export function totalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
}

export function totalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
}

export function currentBalance(transactions: Transaction[]): number {
  return totalIncome(transactions) - totalExpenses(transactions)
}

export function monthlySavings(transactions: Transaction[]): number {
  return totalIncome(transactions) - totalExpenses(transactions)
}

export function categorySpending(
  transactions: Transaction[],
): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of transactions.filter((x) => x.type === 'expense')) {
    map[t.category] = (map[t.category] || 0) + t.amount
  }
  return map
}

export function paymentMethodBreakdown(
  transactions: Transaction[],
): Record<PaymentMethod, number> {
  const map = {} as Record<PaymentMethod, number>
  for (const t of transactions.filter((x) => x.type === 'expense')) {
    map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount
  }
  return map
}

export function dailySpending(
  transactions: Transaction[],
  month: string,
): { date: string; amount: number }[] {
  const { year, month: m } = parseMonthKey(month)
  const days = daysInMonth(year, m)
  const expenses = filterByMonth(transactions, month).filter(
    (t) => t.type === 'expense',
  )
  const result: { date: string; amount: number }[] = []

  for (let d = 1; d <= days; d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`
    const amount = expenses
      .filter((t) => t.date === date)
      .reduce((s, t) => s + t.amount, 0)
    result.push({ date, amount })
  }
  return result
}

export function averageDailySpending(
  transactions: Transaction[],
  month?: string,
): number {
  const m = month || monthKey()
  const expenses = filterByMonth(transactions, m).filter(
    (t) => t.type === 'expense',
  )
  const total = totalExpenses(expenses)
  const today = new Date()
  const current = monthKey(today)
  const { year, month: mo } = parseMonthKey(m)
  const days =
    m === current ? today.getDate() : daysInMonth(year, mo)
  return days > 0 ? total / days : 0
}

export function highestSpendingCategory(
  transactions: Transaction[],
): { category: string; amount: number } | null {
  const map = categorySpending(transactions)
  const entries = Object.entries(map)
  if (!entries.length) return null
  entries.sort((a, b) => b[1] - a[1])
  return { category: entries[0][0], amount: entries[0][1] }
}

export function monthOverMonthChange(
  transactions: Transaction[],
  category?: Category,
): { current: number; previous: number; percent: number } {
  const now = new Date()
  const currentMonth = monthKey(now)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonth = monthKey(prev)

  const sum = (month: string) => {
    let list = filterByMonth(transactions, month).filter(
      (t) => t.type === 'expense',
    )
    if (category) list = list.filter((t) => t.category === category)
    return totalExpenses(list)
  }

  const current = sum(currentMonth)
  const previous = sum(prevMonth)
  const percent =
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100

  return { current, previous, percent }
}

export function budgetProgress(
  budget: Budget,
  transactions: Transaction[],
): {
  spent: number
  remaining: number
  percent: number
  status: 'normal' | 'approaching' | 'near' | 'exceeded'
} {
  const spent = filterByMonth(transactions, budget.month)
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .reduce((s, t) => s + t.amount, 0)
  const remaining = budget.amount - spent
  const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

  let status: 'normal' | 'approaching' | 'near' | 'exceeded' = 'normal'
  if (percent >= 100) status = 'exceeded'
  else if (percent >= 90) status = 'near'
  else if (percent >= 75) status = 'approaching'

  return { spent, remaining, percent, status }
}

export function savingsRate(transactions: Transaction[]): number {
  const income = totalIncome(transactions)
  if (income === 0) return 0
  return (monthlySavings(transactions) / income) * 100
}

export function monthlyRecurringTotal(items: RecurringExpense[]): number {
  return items.reduce((sum, item) => {
    if (item.frequency === 'monthly') return sum + item.amount
    if (item.frequency === 'weekly') return sum + item.amount * 4.33
    if (item.frequency === 'yearly') return sum + item.amount / 12
    return sum
  }, 0)
}

export function estimatedGoalCompletion(
  goal: SavingsGoal,
  monthlySavingsAmount: number,
): { days: number | null; date: Date | null } {
  const remaining = goal.target - goal.saved
  if (remaining <= 0) return { days: 0, date: new Date() }
  if (monthlySavingsAmount <= 0) return { days: null, date: null }
  const days = Math.ceil((remaining / monthlySavingsAmount) * 30)
  const date = new Date()
  date.setDate(date.getDate() + days)
  return { days, date }
}

export function monthlyTrend(
  transactions: Transaction[],
  months = 4,
): { month: string; label: string; income: number; expenses: number }[] {
  const result = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    const list = filterByMonth(transactions, key)
    result.push({
      month: key,
      label: d.toLocaleString('en-IN', { month: 'short' }),
      income: totalIncome(list),
      expenses: totalExpenses(list),
    })
  }
  return result
}

export function generateSmartInsights(
  transactions: Transaction[],
  budgets: Budget[],
  recurring: RecurringExpense[],
): SmartInsight[] {
  const insights: SmartInsight[] = []
  const currentMonth = monthKey()
  const current = filterByMonth(transactions, currentMonth)
  const mom = monthOverMonthChange(transactions)
  const top = highestSpendingCategory(current)
  const avg = averageDailySpending(transactions, currentMonth)
  const recurringTotal = monthlyRecurringTotal(recurring)

  if (top) {
    insights.push({
      id: 'top-cat',
      message: `${top.category} is currently your largest expense category.`,
      type: 'info',
    })
  }

  if (Math.abs(mom.percent) >= 5) {
    insights.push({
      id: 'mom',
      message:
        mom.percent > 0
          ? `Your spending this month is ${Math.round(mom.percent)}% higher than last month.`
          : `Your spending this month is ${Math.round(Math.abs(mom.percent))}% lower than last month.`,
      type: mom.percent > 0 ? 'warning' : 'positive',
    })
  }

  const foodMom = monthOverMonthChange(transactions, 'Food')
  if (Math.abs(foodMom.percent) >= 10) {
    insights.push({
      id: 'food-mom',
      message: `You spent ${Math.round(Math.abs(foodMom.percent))}% ${foodMom.percent > 0 ? 'more' : 'less'} on food this month.`,
      type: foodMom.percent > 0 ? 'warning' : 'positive',
    })
  }

  if (avg > 0) {
    insights.push({
      id: 'avg-daily',
      message: `Your average daily spending is ₹${Math.round(avg).toLocaleString('en-IN')}.`,
      type: 'info',
    })
  }

  if (recurringTotal > 0) {
    insights.push({
      id: 'recurring',
      message: `Your recurring expenses total ₹${Math.round(recurringTotal).toLocaleString('en-IN')}/month.`,
      type: 'info',
    })
  }

  for (const b of budgets.filter((x) => x.month === currentMonth)) {
    const p = budgetProgress(b, transactions)
    if (p.remaining > 0 && p.percent >= 50) {
      insights.push({
        id: `budget-${b.id}`,
        message: `You have ₹${Math.round(p.remaining).toLocaleString('en-IN')} remaining in your ${b.category} budget.`,
        type: p.status === 'near' || p.status === 'approaching' ? 'warning' : 'info',
      })
    } else if (p.status === 'exceeded') {
      insights.push({
        id: `budget-ex-${b.id}`,
        message: `You've used ${Math.round(p.percent)}% of your ${b.category} budget.`,
        type: 'warning',
      })
    }
  }

  return insights.slice(0, 6)
}

export function exportTransactionsCSV(transactions: Transaction[]): string {
  const header = [
    'Date',
    'Type',
    'Amount',
    'Category',
    'Merchant',
    'Payment Method',
    'Notes',
  ]
  const rows = transactions.map((t) =>
    [
      t.date,
      t.type,
      t.amount,
      t.category,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
