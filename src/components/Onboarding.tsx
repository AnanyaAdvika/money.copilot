import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const STEPS = [
  ['Dashboard', 'See your balance, monthly income, expenses, savings, spending overview, recent transactions and smart insights.'],
  ['Transactions', 'Add, edit, search and manage your income and expenses with categories, payment methods, dates and notes.'],
  ['Analytics', 'Explore your spending patterns, category breakdowns and time-based financial trends from your own entries.'],
  ['Budgets & Savings Goals', 'Set category budgets and create savings goals to track progress toward targets.'],
  ['Recurring & Calendar', 'Track recurring expenses and use the calendar to view your money activity over time.'],
  ['Money Copilot & Tools', 'Use the existing Copilot, Scan, Money Leaks, What-If and Afford tools to work with the financial data you enter.'],
]

export function Onboarding({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const finish = () => {
    localStorage.setItem(`moneyCopilot_onboarding_${userId}`, 'true')
    onDone()
  }
  const [title, description] = STEPS[step]
  return <Modal open onClose={finish} title="Welcome to Money Copilot">
    <div className="space-y-5">
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-teal-700 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">Step {step + 1} of {STEPS.length}</p>
        <h3 className="mt-2 font-display text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{description}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          <Button size="sm" onClick={() => step === STEPS.length - 1 ? finish() : setStep((s) => s + 1)}>{step === STEPS.length - 1 ? 'Finish' : 'Next'}</Button>
        </div>
      </div>
    </div>
  </Modal>
}
