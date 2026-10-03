import { type AppSettings } from '@/types'
import { defaultSettings } from '@/data/sampleData'

export interface UserAppData {
  transactions: import('@/types').Transaction[]
  budgets: import('@/types').Budget[]
  goals: import('@/types').SavingsGoal[]
  recurring: import('@/types').RecurringExpense[]
  settings: AppSettings
}

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

export function userStorageKey(userId: string) {
  return `moneyCopilot_data_${userId}`
}

export function initializeStorage(userId: string, userName: string): UserAppData {
  const key = userStorageKey(userId)
  const existing = loadJSON<Partial<UserAppData> | null>(key, null)
  const empty: UserAppData = {
    transactions: [],
    budgets: [],
    goals: [],
    recurring: [],
    settings: { ...defaultSettings, userName },
  }
  if (!existing) {
    saveJSON(key, empty)
    return empty
  }
  return {
    ...empty,
    ...existing,
    transactions: existing.transactions ?? [],
    budgets: existing.budgets ?? [],
    goals: existing.goals ?? [],
    recurring: existing.recurring ?? [],
    settings: { ...empty.settings, ...(existing.settings ?? {}), userName },
  }
}
