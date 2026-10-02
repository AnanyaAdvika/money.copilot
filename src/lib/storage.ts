import { STORAGE_KEYS, type AppSettings } from '@/types'
import {
  createSampleBudgets,
  createSampleGoals,
  createSampleRecurring,
  createSampleTransactions,
  defaultSettings,
} from '@/data/sampleData'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeStorage() {
  const settings = loadJSON<AppSettings | null>(STORAGE_KEYS.settings, null)

  if (!settings) {
    const sampleTx = createSampleTransactions()
    const sampleBudgets = createSampleBudgets()
    const sampleGoals = createSampleGoals()
    const sampleRecurring = createSampleRecurring()

    saveJSON(STORAGE_KEYS.transactions, sampleTx)
    saveJSON(STORAGE_KEYS.budgets, sampleBudgets)
    saveJSON(STORAGE_KEYS.goals, sampleGoals)
    saveJSON(STORAGE_KEYS.recurring, sampleRecurring)
    saveJSON(STORAGE_KEYS.settings, defaultSettings)

    return {
      transactions: sampleTx,
      budgets: sampleBudgets,
      goals: sampleGoals,
      recurring: sampleRecurring,
      settings: defaultSettings,
    }
  }

  return {
    transactions: loadJSON(STORAGE_KEYS.transactions, []),
    budgets: loadJSON(STORAGE_KEYS.budgets, []),
    goals: loadJSON(STORAGE_KEYS.goals, []),
    recurring: loadJSON(STORAGE_KEYS.recurring, []),
    settings,
  }
}

export function clearDemoData() {
  const tx = loadJSON(STORAGE_KEYS.transactions, [] as { isDemo?: boolean }[])
  saveJSON(
    STORAGE_KEYS.transactions,
    tx.filter((t) => !t.isDemo),
  )
  const settings = loadJSON(STORAGE_KEYS.settings, defaultSettings)
  saveJSON(STORAGE_KEYS.settings, { ...settings, demoDataLoaded: false })
}

export function resetToSampleData() {
  saveJSON(STORAGE_KEYS.transactions, createSampleTransactions())
  saveJSON(STORAGE_KEYS.budgets, createSampleBudgets())
  saveJSON(STORAGE_KEYS.goals, createSampleGoals())
  saveJSON(STORAGE_KEYS.recurring, createSampleRecurring())
  saveJSON(STORAGE_KEYS.settings, { ...defaultSettings, demoDataLoaded: true })
}
