import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface LocalUser {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

const USERS_KEY = 'users'
const CURRENT_USER_KEY = 'currentUser'

function readUsers(): LocalUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as LocalUser[] } catch { return [] }
}
function writeUsers(users: LocalUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }
function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `user_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
async function hashPassword(password: string) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const bytes = new TextEncoder().encode(password)
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  return btoa(password)
}

interface AuthContextValue {
  currentUser: LocalUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
  updateUserName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null') as LocalUser | null
      setCurrentUser(stored)
    } catch {
      setCurrentUser(null)
    }
    setReady(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const user = readUsers().find((u) => u.email === normalized)
    if (!user) return 'No account found with that email.'
    if (user.passwordHash !== await hashPassword(password)) return 'Incorrect password.'
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    setCurrentUser(user)
    return null
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const users = readUsers()
    if (users.some((u) => u.email === normalized)) return 'An account with that email already exists.'
    const user: LocalUser = {
      id: makeId(),
      name: name.trim(),
      email: normalized,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    }
    writeUsers([...users, user])
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
    const updated = { ...currentUser, name: trimmed }
    const users = readUsers().map((u) => u.id === updated.id ? updated : u)
    writeUsers(users)
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
