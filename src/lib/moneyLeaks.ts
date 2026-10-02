import type { MoneyLeakInsight, Transaction } from '@/types'
import {
  categorySpending,
  filterByMonth,
  monthOverMonthChange,
  totalExpenses,
} from '@/lib/calculations'
import { monthKey } from '@/lib/utils'

const FOOD_DELIVERY = ['swiggy', 'zomato', 'blinkit', 'dunzo', 'eat.fit']

export function detectMoneyLeaks(
  transactions: Transaction[],
): MoneyLeakInsight[] {
  const insights: MoneyLeakInsight[] = []
  const currentMonth = monthKey()
  const current = filterByMonth(transactions, currentMonth).filter(
    (t) => t.type === 'expense',
  )

  if (!current.length) return insights

  // Food delivery frequency
  const foodDelivery = current.filter((t) =>
    FOOD_DELIVERY.some((m) => t.merchant.toLowerCase().includes(m)),
  )
  if (foodDelivery.length >= 5) {
    const total = totalExpenses(foodDelivery)
    const prevMonth = monthKey(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    )
    const prevDelivery = filterByMonth(transactions, prevMonth).filter(
      (t) =>
        t.type === 'expense' &&
        FOOD_DELIVERY.some((m) => t.merchant.toLowerCase().includes(m)),
    )
    const prevTotal = totalExpenses(prevDelivery)
    const change =
      prevTotal === 0
        ? 100
        : ((total - prevTotal) / prevTotal) * 100

    insights.push({
      id: 'food-delivery',
      title: 'Food Delivery Pattern',
      description: `You made ${foodDelivery.length} food delivery purchases this month.`,
      amount: total,
      previousAmount: prevTotal || undefined,
      changePercent: prevTotal ? change : undefined,
      category: 'Food',
      type: 'frequency',
      transactionIds: foodDelivery.map((t) => t.id),
    })
  }

  // Micro-spending
  const micro = current.filter((t) => t.amount < 200)
  const microPct = (micro.length / current.length) * 100
  if (microPct >= 40 && micro.length >= 5) {
    insights.push({
      id: 'micro-spending',
      title: 'Micro-Spending Pattern',
      description: `${Math.round(microPct)}% of your transactions were below ₹200.`,
      amount: totalExpenses(micro),
      type: 'micro',
      transactionIds: micro.map((t) => t.id),
    })
  }

  // Category spikes
  const categories = Object.keys(categorySpending(current)) as (
    | 'Food'
    | 'Transport'
    | 'Shopping'
    | 'Education'
    | 'Entertainment'
    | 'Health'
    | 'Hostel/Rent'
    | 'Subscriptions'
    | 'Travel'
    | 'Other'
  )[]

  for (const cat of categories) {
    const mom = monthOverMonthChange(transactions, cat)
    if (mom.previous > 0 && mom.current - mom.previous >= 500 && mom.percent >= 20) {
      insights.push({
        id: `spike-${cat}`,
        title: `${cat} Spending Increase`,
        description: `${cat} spending increased ₹${Math.round(mom.current - mom.previous).toLocaleString('en-IN')} compared with last month.`,
        amount: mom.current,
        previousAmount: mom.previous,
        changePercent: mom.percent,
        category: cat,
        type: 'increase',
        transactionIds: current.filter((t) => t.category === cat).map((t) => t.id),
      })
    }
  }

  // Repeated merchant spending
  const merchantMap = new Map<string, Transaction[]>()
  for (const t of current) {
    const key = t.merchant.toLowerCase()
    if (!merchantMap.has(key)) merchantMap.set(key, [])
    merchantMap.get(key)!.push(t)
  }

  for (const [, txs] of merchantMap) {
    if (txs.length >= 4) {
      const total = totalExpenses(txs)
      insights.push({
        id: `merchant-${txs[0].merchant}`,
        title: `Repeated Merchant: ${txs[0].merchant}`,
        description: `Pattern detected — ${txs.length} purchases at ${txs[0].merchant} this month.`,
        amount: total,
        type: 'merchant',
        category: txs[0].category === 'Income' ? 'Other' : txs[0].category,
        transactionIds: txs.map((t) => t.id),
      })
    }
  }

  // High vs historical average (simple: avg of last 2 months categories)
  const histMonths = [1, 2].map((i) =>
    monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)),
  )
  const histExpenses = histMonths.flatMap((m) =>
    filterByMonth(transactions, m).filter((t) => t.type === 'expense'),
  )
  if (histExpenses.length > 5) {
    const histAvg =
      histExpenses.reduce((s, t) => s + t.amount, 0) / histMonths.length
    const currentTotal = totalExpenses(current)
    if (currentTotal > histAvg * 1.25) {
      insights.push({
        id: 'above-avg',
        title: 'Above Historical Average',
        description: `Spending this month is ${Math.round(((currentTotal - histAvg) / histAvg) * 100)}% higher than your recent monthly average. Potential area to review.`,
        amount: currentTotal,
        previousAmount: histAvg,
        changePercent: ((currentTotal - histAvg) / histAvg) * 100,
        type: 'increase',
        transactionIds: current.map((t) => t.id),
      })
    }
  }

  // Recurring discretionary (subscriptions)
  const subs = current.filter((t) => t.category === 'Subscriptions')
  if (subs.length >= 2) {
    insights.push({
      id: 'subs-discretionary',
      title: 'Recurring Discretionary Expenses',
      description: `You have ${subs.length} subscription payments totaling ₹${totalExpenses(subs).toLocaleString('en-IN')} this month.`,
      amount: totalExpenses(subs),
      category: 'Subscriptions',
      type: 'recurring',
      transactionIds: subs.map((t) => t.id),
    })
  }

  // Dedupe by id and limit
  const seen = new Set<string>()
  return insights.filter((i) => {
    if (seen.has(i.id)) return false
    seen.add(i.id)
    return true
  })
}
