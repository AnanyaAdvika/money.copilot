import type { AppSettings, Budget, RecurringExpense, SavingsGoal, Transaction } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface CloudUser { id: string; email: string; user_metadata?: { name?: string }; created_at?: string }
export interface CloudSession { access_token: string; refresh_token: string; user: CloudUser }
export interface CloudAppData { transactions: Transaction[]; budgets: Budget[]; goals: SavingsGoal[]; recurring: RecurringExpense[]; settings: AppSettings }
export interface CloudRecord { data: CloudAppData; onboarding_completed: boolean }

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Cloud sync is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in deployment settings.')
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } })
  const body = await response.text()
  let parsed: unknown = null
  try { parsed = body ? JSON.parse(body) : null } catch {}
  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed !== null ? ((parsed as { msg?: string; message?: string; error_description?: string }).msg || (parsed as { message?: string }).message || (parsed as { error_description?: string }).error_description) : null
    throw new Error(message || 'Cloud request failed.')
  }
  return parsed as T
}
export function signUp(name: string, email: string, password: string) { return request<CloudSession | null>('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, data: { name } }) }) }
export function signIn(email: string, password: string) { return request<CloudSession>('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }) }
export function refreshSession(refreshToken: string) { return request<CloudSession>('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }) }
export function getUser(token: string) { return request<CloudUser>('/auth/v1/user', {}, token) }
export async function signOut(token: string) { try { await request('/auth/v1/logout', { method: 'POST' }, token) } catch {} }
export function updateProfileName(token: string, name: string) { return request<CloudUser>('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ data: { name } }) }, token) }
export async function loadCloudRecord(token: string) {
  const rows = await request<CloudRecord[]>('/rest/v1/money_copilot_data?select=data,onboarding_completed&limit=1', { headers: { Accept: 'application/json' } }, token)
  return rows[0] ?? null
}
export async function saveCloudRecord(userId: string, token: string, record: CloudRecord) {
  await request('/rest/v1/money_copilot_data?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: userId, data: record.data, onboarding_completed: record.onboarding_completed, updated_at: new Date().toISOString() }) }, token)
}
