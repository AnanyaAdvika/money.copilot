import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface LocalUser { id: string; name: string; email: string; createdAt: string }
interface StoredAccount extends LocalUser { passwordHash: string }
interface AuthContextValue {
  currentUser: LocalUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
  updateUserName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const ACCOUNTS_KEY = 'moneyCopilot_accounts'
const CURRENT_USER_KEY = 'moneyCopilot_currentUser'

function loadAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as StoredAccount[] } catch { return [] }
}
function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}
async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}
function publicUser(account: StoredAccount): LocalUser {
  const { passwordHash: _passwordHash, ...user } = account
  return user
}
function makeId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `user_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null') as LocalUser | null
      const accounts = loadAccounts()
      if (stored && accounts.some(a => a.id === stored.id)) setCurrentUser(stored)
      else localStorage.removeItem(CURRENT_USER_KEY)
    } catch {
      localStorage.removeItem(CURRENT_USER_KEY)
    } finally {
      setReady(true)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const account = loadAccounts().find(a => a.email === normalizedEmail)
    if (!account) return 'No account found with this email. Create an account first.'
    if (account.passwordHash !== await hashPassword(password)) return 'Incorrect password.'
    const user = publicUser(account)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    setCurrentUser(user)
    return null
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const accounts = loadAccounts()
    if (accounts.some(a => a.email === normalizedEmail)) return 'An account with this email already exists.'
    const account: StoredAccount = {
      id: makeId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    }
    accounts.push(account)
    saveAccounts(accounts)
    const user = publicUser(account)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    setCurrentUser(user)
    return null
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
  }, [])

  const updateUserName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed || !currentUser) return
    const accounts = loadAccounts()
    const index = accounts.findIndex(a => a.id === currentUser.id)
    if (index === -1) return
    accounts[index] = { ...accounts[index], name: trimmed }
    saveAccounts(accounts)
    const updated = publicUser(accounts[index])
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
    setCurrentUser(updated)
  }, [currentUser])

  const value = useMemo(() => ({ currentUser, ready, login, signup, logout, updateUserName }), [currentUser, ready, login, signup, logout, updateUserName])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
