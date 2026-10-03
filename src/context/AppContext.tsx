import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppSettings, Budget, RecurringExpense, SavingsGoal, Transaction } from '@/types'
import { initializeStorage, saveJSON, userStorageKey } from '@/lib/storage'
import { uid } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [ready, setReady] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [recurring, setRecurring] = useState<RecurringExpense[]>([])
  const [settings, setSettings] = useState<AppSettings>({} as AppSettings)

  useEffect(() => {
    if (!currentUser) {
      setReady(false)
      return
    }
    const data = initializeStorage(currentUser.id, currentUser.name)
    setTransactions(data.transactions)
    setBudgets(data.budgets)
    setGoals(data.goals)
    setRecurring(data.recurring)
    setSettings(data.settings)
    setReady(true)
  }, [currentUser?.id, currentUser?.name])

  const persist = useCallback((next: Partial<{ transactions: Transaction[]; budgets: Budget[]; goals: SavingsGoal[]; recurring: RecurringExpense[]; settings: AppSettings }>) => {
    if (!currentUser) return
    const key = userStorageKey(currentUser.id)
    const current = JSON.parse(localStorage.getItem(key) || '{}')
    saveJSON(key, { ...current, ...next })
  }, [currentUser])

  useEffect(() => { if (ready) persist({ transactions }) }, [transactions, ready, persist])
  useEffect(() => { if (ready) persist({ budgets }) }, [budgets, ready, persist])
  useEffect(() => { if (ready) persist({ goals }) }, [goals, ready, persist])
  useEffect(() => { if (ready) persist({ recurring }) }, [recurring, ready, persist])
  useEffect(() => {
    if (!ready) return
    persist({ settings })
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings, ready, persist])

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => setTransactions(p => [{ ...t, id: uid('tx') }, ...p]), [])
  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => setTransactions(p => p.map(t => t.id === id ? { ...t, ...patch } : t)), [])
  const deleteTransaction = useCallback((id: string) => setTransactions(p => p.filter(t => t.id !== id)), [])
  const addBudget = useCallback((b: Omit<Budget, 'id'>) => setBudgets(p => [...p, { ...b, id: uid('budget') }]), [])
  const updateBudget = useCallback((id: string, patch: Partial<Budget>) => setBudgets(p => p.map(b => b.id === id ? { ...b, ...patch } : b)), [])
  const deleteBudget = useCallback((id: string) => setBudgets(p => p.filter(b => b.id !== id)), [])
  const addGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt'>) => setGoals(p => [...p, { ...g, id: uid('goal'), createdAt: new Date().toISOString() }]), [])
  const updateGoal = useCallback((id: string, patch: Partial<SavingsGoal>) => setGoals(p => p.map(g => g.id === id ? { ...g, ...patch } : g)), [])
  const deleteGoal = useCallback((id: string) => setGoals(p => p.filter(g => g.id !== id)), [])
  const addToGoal = useCallback((id: string, amount: number) => setGoals(p => p.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)), [])
  const addRecurring = useCallback((r: Omit<RecurringExpense, 'id'>) => setRecurring(p => [...p, { ...r, id: uid('rec') }]), [])
  const updateRecurring = useCallback((id: string, patch: Partial<RecurringExpense>) => setRecurring(p => p.map(r => r.id === id ? { ...r, ...patch } : r)), [])
  const deleteRecurring = useCallback((id: string) => setRecurring(p => p.filter(r => r.id !== id)), [])
  const updateSettings = useCallback((patch: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...patch, studentMode: patch.studentMode ? { ...prev.studentMode, ...patch.studentMode } : prev.studentMode })), [])

  const value = useMemo(() => ({ transactions, budgets, goals, recurring, settings, ready, addTransaction, updateTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal, addToGoal, addRecurring, updateRecurring, deleteRecurring, updateSettings }), [transactions, budgets, goals, recurring, settings, ready, addTransaction, updateTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal, addToGoal, addRecurring, updateRecurring, deleteRecurring, updateSettings])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
