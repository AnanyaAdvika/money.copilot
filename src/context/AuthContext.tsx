import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getUser, refreshSession, signIn, signOut, signUp, updateProfileName, type CloudSession } from '@/lib/cloud'

export interface LocalUser { id: string; name: string; email: string; createdAt: string }
interface StoredSession { access_token: string; refresh_token: string }
interface AuthContextValue { currentUser: LocalUser | null; ready: boolean; session: StoredSession | null; login: (email: string, password: string) => Promise<string | null>; signup: (name: string, email: string, password: string) => Promise<string | null>; logout: () => void; updateUserName: (name: string) => void }
const AuthContext = createContext<AuthContextValue | null>(null)
function saveSession(s: CloudSession) { localStorage.setItem('moneyCopilot_session', JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token })) }
function saveUser(u: CloudSession['user']) { const user={id:u.id,name:u.user_metadata?.name||u.email.split('@')[0],email:u.email,createdAt:u.created_at||new Date().toISOString()}; localStorage.setItem('currentUser',JSON.stringify(user)); return user }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser,setCurrentUser]=useState<LocalUser|null>(null); const [session,setSession]=useState<StoredSession|null>(null); const [ready,setReady]=useState(false)
  useEffect(()=>{ let cancelled=false; (async()=>{ try { const stored=JSON.parse(localStorage.getItem('moneyCopilot_session')||'null') as StoredSession|null; if(!stored?.refresh_token)return; let active=stored; try{const s=await refreshSession(stored.refresh_token);saveSession(s);active={access_token:s.access_token,refresh_token:s.refresh_token}}catch{} const u=await getUser(active.access_token); if(!cancelled){setSession(active);setCurrentUser(saveUser(u))} }catch{localStorage.removeItem('moneyCopilot_session');localStorage.removeItem('currentUser')} finally{if(!cancelled)setReady(true)} })(); return()=>{cancelled=true} },[])
  const login=useCallback(async(email:string,password:string)=>{try{const s=await signIn(email.trim().toLowerCase(),password);saveSession(s);setSession({access_token:s.access_token,refresh_token:s.refresh_token});setCurrentUser(saveUser(s.user));return null}catch(e){return e instanceof Error?e.message:'Unable to log in.'}},[])
  const signup=useCallback(async(name:string,email:string,password:string)=>{try{const s=await signUp(name.trim(),email.trim().toLowerCase(),password);if(!s?.access_token)return 'Account created. Please verify your email, then log in.';saveSession(s);setSession({access_token:s.access_token,refresh_token:s.refresh_token});setCurrentUser(saveUser(s.user));return null}catch(e){return e instanceof Error?e.message:'Unable to create your account.'}},[])
  const logout=useCallback(()=>{if(session?.access_token)void signOut(session.access_token);localStorage.removeItem('moneyCopilot_session');localStorage.removeItem('currentUser');setSession(null);setCurrentUser(null)},[session])
  const updateUserName=useCallback((name:string)=>{const trimmed=name.trim();if(!trimmed||!currentUser||!session)return;const updated={...currentUser,name:trimmed};localStorage.setItem('currentUser',JSON.stringify(updated));setCurrentUser(updated);void updateProfileName(session.access_token,trimmed).catch(()=>{})},[currentUser,session])
  const value=useMemo(()=>({currentUser,ready,session,login,signup,logout,updateUserName}),[currentUser,ready,session,login,signup,logout,updateUserName])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error('useAuth must be used within AuthProvider');return ctx}
