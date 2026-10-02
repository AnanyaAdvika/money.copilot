import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppSettings,
  Budget,
  RecurringExpense,
  SavingsGoal,
  Transaction,
} from '@/types'
import { STORAGE_KEYS } from '@/types'
import { initializeStorage, saveJSON } from '@/lib/storage'
import {
  createSampleBudgets,
  createSampleGoals,
  createSampleRecurring,
  createSampleTransactions,
  defaultSettings,
} from '@/data/sampleData'
import { uid } from '@/lib/utils'

interface AppContextValue {
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingsGoal[]
  recurring: RecurringExpense[]
  settings: AppSettings
  ready: boolean
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addBudget: (b: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, patch: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  addGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void
  addToGoal: (id: string, amount: number) => void
  addRecurring: (r: Omit<RecurringExpense, 'id'>) => void
  updateRecurring: (id: string, patch: Partial<RecurringExpense>) => void
  deleteRecurring: (id: string) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  clearDemoData: () => void
  resetDemoData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [recurring, setRecurring] = useState<RecurringExpense[]>([])
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    const data = initializeStorage()
    setTransactions(data.transactions)
    setBudgets(data.budgets)
    setGoals(data.goals)
    setRecurring(data.recurring)
    setSettings(data.settings)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveJSON(STORAGE_KEYS.transactions, transactions)
  }, [transactions, ready])

  useEffect(() => {
    if (!ready) return
    saveJSON(STORAGE_KEYS.budgets, budgets)
  }, [budgets, ready])

  useEffect(() => {
    if (!ready) return
    saveJSON(STORAGE_KEYS.goals, goals)
  }, [goals, ready])

  useEffect(() => {
    if (!ready) return
    saveJSON(STORAGE_KEYS.recurring, recurring)
  }, [recurring, ready])

  useEffect(() => {
    if (!ready) return
    saveJSON(STORAGE_KEYS.settings, settings)
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings, ready])

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => [{ ...t, id: uid('tx') }, ...prev])
  }, [])

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      )
    },
    [],
  )

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addBudget = useCallback((b: Omit<Budget, 'id'>) => {
    setBudgets((prev) => [...prev, { ...b, id: uid('budget') }])
  }, [])

  const updateBudget = useCallback((id: string, patch: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [])

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addGoal = useCallback(
    (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
      setGoals((prev) => [
        ...prev,
        { ...g, id: uid('goal'), createdAt: new Date().toISOString() },
      ])
    },
    [],
  )

  const updateGoal = useCallback((id: string, patch: Partial<SavingsGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const addToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g,
      ),
    )
  }, [])

  const addRecurring = useCallback((r: Omit<RecurringExpense, 'id'>) => {
    setRecurring((prev) => [...prev, { ...r, id: uid('rec') }])
  }, [])

  const updateRecurring = useCallback(
    (id: string, patch: Partial<RecurringExpense>) => {
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      )
    },
    [],
  )

  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
      studentMode: patch.studentMode
        ? { ...prev.studentMode, ...patch.studentMode }
        : prev.studentMode,
    }))
  }, [])

  const clearDemoData = useCallback(() => {
    setTransactions((prev) => prev.filter((t) => !t.isDemo))
    setSettings((prev) => ({ ...prev, demoDataLoaded: false }))
  }, [])

  const resetDemoData = useCallback(() => {
    setTransactions(createSampleTransactions())
    setBudgets(createSampleBudgets())
    setGoals(createSampleGoals())
    setRecurring(createSampleRecurring())
    setSettings({ ...defaultSettings, darkMode: settings.darkMode, demoDataLoaded: true })
  }, [settings.darkMode])

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      goals,
      recurring,
      settings,
      ready,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addToGoal,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      updateSettings,
      clearDemoData,
      resetDemoData,
    }),
    [
      transactions,
      budgets,
      goals,
      recurring,
      settings,
      ready,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addToGoal,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      updateSettings,
      clearDemoData,
      resetDemoData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
