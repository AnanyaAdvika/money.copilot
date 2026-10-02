import type { Category, SavingsGoal, WhatIfScenario } from '@/types'
import { estimatedGoalCompletion } from '@/lib/calculations'

export interface WhatIfResult {
  currentMonthlySavings: number
  projectedMonthlySavings: number
  monthlyDifference: number
  annualDifference: number
  scenarioLabel: string
  goalImpact: { goalName: string; daysEarlier: number } | null
}

export function monthlyImpactFromScenario(scenario: WhatIfScenario): {
  savingsDelta: number
  label: string
} {
  switch (scenario.type) {
    case 'reduce_weekly':
      return {
        savingsDelta: scenario.amount * 4.33,
        label: `Reduce ${scenario.category} spending by ₹${scenario.amount.toLocaleString('en-IN')}/week`,
      }
    case 'save_monthly':
      return {
        savingsDelta: scenario.amount,
        label: `Save ₹${scenario.amount.toLocaleString('en-IN')} more every month`,
      }
    case 'cancel_subscription':
      return {
        savingsDelta: scenario.amount,
        label: `Cancel a ₹${scenario.amount.toLocaleString('en-IN')}/month subscription`,
      }
    case 'income_increase':
      return {
        savingsDelta: scenario.amount,
        label: `Monthly income increases by ₹${scenario.amount.toLocaleString('en-IN')}`,
      }
  }
}

export function calculateWhatIf(
  currentMonthlySavings: number,
  scenario: WhatIfScenario,
  goals: SavingsGoal[] = [],
): WhatIfResult {
  const { savingsDelta, label } = monthlyImpactFromScenario(scenario)
  const projected = currentMonthlySavings + savingsDelta
  const monthlyDifference = savingsDelta
  const annualDifference = savingsDelta * 12

  let goalImpact: WhatIfResult['goalImpact'] = null
  const activeGoal = goals.find((g) => g.saved < g.target)
  if (activeGoal && currentMonthlySavings > 0 && projected > currentMonthlySavings) {
    const currentEst = estimatedGoalCompletion(activeGoal, currentMonthlySavings)
    const newEst = estimatedGoalCompletion(activeGoal, projected)
    if (currentEst.days != null && newEst.days != null) {
      goalImpact = {
        goalName: activeGoal.name,
        daysEarlier: Math.max(0, currentEst.days - newEst.days),
      }
    }
  }

  return {
    currentMonthlySavings,
    projectedMonthlySavings: projected,
    monthlyDifference,
    annualDifference,
    scenarioLabel: label,
    goalImpact,
  }
}

export function projectionSeries(
  currentMonthly: number,
  projectedMonthly: number,
  months = 12,
): { month: number; current: number; projected: number }[] {
  const series = []
  let c = 0
  let p = 0
  for (let i = 1; i <= months; i++) {
    c += currentMonthly
    p += projectedMonthly
    series.push({ month: i, current: Math.round(c), projected: Math.round(p) })
  }
  return series
}

export const WHAT_IF_PRESETS: {
  label: string
  scenario: WhatIfScenario
}[] = [
  {
    label: 'Spend ₹500 less on food every week',
    scenario: { type: 'reduce_weekly', category: 'Food' as Category, amount: 500 },
  },
  {
    label: 'Save ₹2,000 more every month',
    scenario: { type: 'save_monthly', amount: 2000 },
  },
  {
    label: 'Cancel a ₹649 subscription',
    scenario: { type: 'cancel_subscription', amount: 649 },
  },
  {
    label: 'Income increases by ₹5,000',
    scenario: { type: 'income_increase', amount: 5000 },
  },
]
