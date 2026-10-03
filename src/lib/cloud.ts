import type { AppSettings, Budget, RecurringExpense, SavingsGoal, Transaction } from '@/types'

const env = import.meta.env
const SUPABASE_URL = env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

export interface CloudUser {
  id: string
  email: string
  user_metadata?: { name?: string }
  created_at?: string
}

export interface CloudSession {
  access_token: string
  refresh_token: string
  user: CloudUser
}

export interface CloudAppData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingsGoal[]
  recurring: RecurringExpense[]
  settings: AppSettings
}

function configError() {
  return 'Cloud sync is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment settings.'
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error(configError())
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  const body = await response.text()
  let parsed: unknown = null
  try { parsed = body ? JSON.parse(body) : null } catch {}
  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed !== null
      ? ((parsed as { msg?: string; message?: string; error_description?: string }).msg ||
         (parsed as { message?: string }).message ||
         (parsed as { error_description?: string }).error_description)
      : null
    throw new Error(message || 'Cloud request failed.')
  }
  return parsed as T
}

export async function signUp(name: string, email: string, password: string): Promise<CloudSession | null> {
  const result = await request<CloudSession>('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: { name } }),
  })
  return result?.access_token ? result : null
}

export async function signIn(email: string, password: string): Promise<CloudSession> {
  return request<CloudSession>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function refreshSession(refreshToken: string): Promise<CloudSession> {
  return request<CloudSession>('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function getUser(token: string): Promise<CloudUser> {
  return request<CloudUser>('/auth/v1/user', {}, token)
}

export async function signOut(token: string) {
  await request<unknown>('/auth/v1/logout', { method: 'POST' }, token)
}

export async function updateProfileName(token: string, name: string): Promise<CloudUser> {
  return request<CloudUser>('/auth/v1/user', {
    method: 'PUT',
    body: JSON.stringify({ data: { name } }),
  }, token)
}

export async function loadAppData(token: string): Promise<CloudAppData | null> {
  const rows = await request<Array<{ data: CloudAppData }>>(
    '/rest/v1/money_copilot_data?select=data&limit=1',
    { headers: { Accept: 'application/json' } },
    token,
  )
  return rows[0]?.data ?? null
}

export async function saveAppData(userId: string, token: string, data: CloudAppData) {
  await request<unknown>('/rest/v1/money_copilot_data?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, data, updated_at: new Date().toISOString() }),
  }, token)
}

export async function loadOnboarding(token: string): Promise<boolean> {
  const rows = await request<Array<{ onboarding_completed: boolean }>>(
    '/rest/v1/money_copilot_data?select=onboarding_completed&limit=1',
    { headers: { Accept: 'application/json' } },
    token,
  )
  return Boolean(rows[0]?.onboarding_completed)
}

export async function saveOnboarding(userId: string, token: string) {
  await request<unknown>('/rest/v1/money_copilot_data?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, onboarding_completed: true, updated_at: new Date().toISOString() }),
  }, token)
}
