import type {
  Budget,
  RecurringExpense,
  SavingsGoal,
  Transaction,
} from '@/types'
import {
  budgetProgress,
  currentBalance,
  filterByMonth,
  monthlyRecurringTotal,
  monthlySavings,
  totalExpenses,
  totalIncome,
  estimatedGoalCompletion,
} from '@/lib/calculations'
import { monthKey } from '@/lib/utils'

export interface AffordabilityResult {
  purchaseName: string
  purchaseAmount: number
  balance: number
  monthIncome: number
  monthExpenses: number
  upcomingCommitments: number
  availableAfterCommitments: number
  afterPurchase: number
  safeToSpend: number
  budgetImpacts: {
    category: string
    remaining: number
    wouldExceed: boolean
  }[]
  goalImpact: {
    goalName: string
    extraDays: number
  } | null
  summary: string
}

export function calculateAffordability(
  purchaseName: string,
  purchaseAmount: number,
  transactions: Transaction[],
  recurring: RecurringExpense[],
  budgets: Budget[],
  goals: SavingsGoal[],
  purchaseCategory?: string,
): AffordabilityResult {
  const month = monthKey()
  const monthTx = filterByMonth(transactions, month)
  const balance = currentBalance(transactions)
  const monthIncome = totalIncome(monthTx)
  const monthExpenses = totalExpenses(monthTx)
  const upcomingCommitments = monthlyRecurringTotal(recurring)
  const availableAfterCommitments = balance - upcomingCommitments
  const afterPurchase = availableAfterCommitments - purchaseAmount

  // Safe-to-spend: remaining after expenses & commitments relative to income
  const remainingIncome = monthIncome - monthExpenses - upcomingCommitments * 0.3
  const safeToSpend = Math.max(0, Math.min(availableAfterCommitments, remainingIncome))

  const monthBudgets = budgets.filter((b) => b.month === month)
  const budgetImpacts = monthBudgets.map((b) => {
    const p = budgetProgress(b, transactions)
    const wouldExceed =
      purchaseCategory === b.category && p.remaining < purchaseAmount
    return {
      category: b.category,
      remaining: p.remaining,
      wouldExceed,
    }
  })

  let goalImpact: AffordabilityResult['goalImpact'] = null
  const savings = monthlySavings(monthTx)
  const activeGoal = goals.find((g) => g.saved < g.target)
  if (activeGoal && savings > 0) {
    const without = estimatedGoalCompletion(activeGoal, savings)
    const withPurchase = estimatedGoalCompletion(
      { ...activeGoal, saved: activeGoal.saved },
      Math.max(0, savings - purchaseAmount / 30),
    )
    // Approximate: treating purchase as reducing monthly savings rate
    const reducedSavings = Math.max(0, savings - purchaseAmount)
    const withPurchaseAlt = estimatedGoalCompletion(activeGoal, Math.max(1, reducedSavings))
    if (without.days != null && withPurchaseAlt.days != null) {
      goalImpact = {
        goalName: activeGoal.name,
        extraDays: Math.max(0, withPurchaseAlt.days - without.days),
      }
    } else if (without.days != null && withPurchase.days != null) {
      goalImpact = {
        goalName: activeGoal.name,
        extraDays: Math.max(0, withPurchase.days - without.days),
      }
    }
  }

  return {
    purchaseName,
    purchaseAmount,
    balance,
    monthIncome,
    monthExpenses,
    upcomingCommitments,
    availableAfterCommitments,
    afterPurchase,
    safeToSpend,
    budgetImpacts,
    goalImpact,
    summary: "Here's what this purchase would change.",
  }
}
