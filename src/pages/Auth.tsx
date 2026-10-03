import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) return setError('Enter your email and password.')
    const message = await login(email, password)
    if (message) setError(message)
    else navigate('/')
  }

  return <AuthShell title="Welcome back" subtitle="Log in to your Money Copilot account.">
    <form onSubmit={submit} className="space-y-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" size="lg" className="w-full">Log in</Button>
      <p className="text-center text-sm text-[var(--color-ink-muted)]">New here? <Link className="font-medium text-[var(--color-primary)]" to="/signup">Create an account</Link></p>
    </form>
  </AuthShell>
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) return setError('Please fill in all fields.')
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    const message = await signup(form.name.trim(), form.email.trim().toLowerCase(), form.password)
    if (message) setError(message)
    else navigate('/')
  }

  return <AuthShell title="Create your account" subtitle="Your money data stays in this browser.">
    <form onSubmit={submit} className="space-y-4">
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
      <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
      <Input label="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" size="lg" className="w-full">Create account</Button>
      <p className="text-center text-sm text-[var(--color-ink-muted)]">Already have an account? <Link className="font-medium text-[var(--color-primary)]" to="/login">Log in</Link></p>
    </form>
  </AuthShell>
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center bg-[var(--color-surface)] px-4 py-8">
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-display font-bold shadow-lg shadow-teal-900/20">₹</div>
        <div><p className="font-display font-bold text-xl">Money Copilot</p><p className="text-xs text-[var(--color-ink-muted)]">Student money OS</p></div>
      </div>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
}
