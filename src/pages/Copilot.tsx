import { PageHeader } from '@/components/common/SummaryCard'
import { Card, CardBody } from '@/components/ui/Card'
import { generateSmartInsights } from '@/lib/calculations'
import { useApp } from '@/context/AppContext'
import {
  CircleDollarSign,
  Droplets,
  FlaskConical,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    to: '/scan',
    title: 'Scan Receipt / UPI',
    description: 'Upload a screenshot and confirm the extracted expense in seconds.',
    icon: ScanLine,
    accent: 'from-orange-500 to-rose-500',
  },
  {
    to: '/leaks',
    title: 'Money Leak Detector',
    description: 'Surface spending patterns — frequency, spikes, micro-buys — neutrally.',
    icon: Droplets,
    accent: 'from-sky-500 to-indigo-600',
  },
  {
    to: '/what-if',
    title: 'What-If Simulator',
    description: 'Slide through scenarios and see projected monthly & annual impact.',
    icon: FlaskConical,
    accent: 'from-teal-500 to-emerald-600',
  },
  {
    to: '/afford',
    title: 'Can I Afford This?',
    description: 'Model a purchase against balance, budgets, goals, and commitments.',
    icon: CircleDollarSign,
    accent: 'from-amber-500 to-orange-600',
  },
]

export function CopilotPage() {
  const { transactions, budgets, recurring } = useApp()
  const insights = generateSmartInsights(transactions, budgets, recurring)

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Money Copilot"
        subtitle="Your signature toolkit for smarter student money decisions."
      />

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 text-orange-300" />
            <p className="text-teal-100 text-sm font-medium">
              Personal money copilot for students
            </p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold max-w-xl">
            Four features that go beyond basic expense tracking.
          </h2>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <CardBody className="space-y-3">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">{f.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardBody>
          <h3 className="font-display font-semibold mb-3">Live smart insights</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {insights.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              >
                {i.message}
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-4">
            Rule-based insights from your data — no AI chatbot yet.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
