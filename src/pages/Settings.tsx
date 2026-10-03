import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { downloadCSV, exportTransactionsCSV } from '@/lib/calculations'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    clearDemoData,
    resetDemoData,
    transactions,
  } = useApp()
  const { toast } = useToast()
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const sm = settings.studentMode

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Theme, student mode, and exports."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Display name"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
          />
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
            <div>
              <p className="font-medium text-sm">Dark mode</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Soft light is default</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            >
              {settings.darkMode ? (
                <>
                  <Sun className="h-4 w-4" /> Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" /> Dark
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Mode</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 cursor-pointer">
            <div>
              <p className="font-medium text-sm">Enable Student Mode</p>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Allowance tracker & suggested daily spend on the dashboard
              </p>
            </div>
            <input
              type="checkbox"
              checked={sm.enabled}
              onChange={(e) =>
                updateSettings({
                  studentMode: { ...sm, enabled: e.target.checked },
                })
              }
              className="h-5 w-5 accent-teal-700"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            {(
              [
                ['monthlyAllowance', 'Monthly allowance (₹)'],
                ['hostelRent', 'Hostel / rent (₹)'],
                ['foodBudget', 'Food budget (₹)'],
                ['transportBudget', 'Transport budget (₹)'],
                ['entertainmentBudget', 'Entertainment budget (₹)'],
                ['savingsTarget', 'Savings target (₹)'],
                ['allowanceDay', 'Allowance day of month'],
              ] as const
            ).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                type="number"
                value={sm[key]}
                onChange={(e) =>
                  updateSettings({
                    studentMode: {
                      ...sm,
                      [key]: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Suggested daily spending is a calculation from remaining money — not financial
            advice.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              downloadCSV(
                exportTransactionsCSV(transactions),
                `money-copilot-${new Date().toISOString().slice(0, 10)}.csv`,
              )
              toast('CSV exported successfully.')
            }}
          >
            Export CSV
          </Button>
          {settings.demoDataLoaded && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="h-4 w-4" /> Clear Demo Data
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-4 w-4" /> Reload Sample Demo Data
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={logout}>Log out</Button>\n          <div className="pt-2 grid grid-cols-2 gap-2 text-sm">
            <Link to="/budgets" className="text-[var(--color-primary)]">
              Manage budgets →
            </Link>
            <Link to="/goals" className="text-[var(--color-primary)]">
              Savings goals →
            </Link>
            <Link to="/recurring" className="text-[var(--color-primary)]">
              Recurring →
            </Link>
            <Link to="/calendar" className="text-[var(--color-primary)]">
              Calendar →
            </Link>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear demo data?"
        message="All demo transactions will be removed. Your own entries stay."
        confirmLabel="Clear Demo Data"
        onConfirm={() => {
          clearDemoData()
          toast('Demo data cleared.')
        }}
      />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reload sample data?"
        message="This replaces transactions, budgets, goals, and recurring items with the demo dataset."
        confirmLabel="Reload Demo"
        onConfirm={() => {
          resetDemoData()
          toast('Sample demo data restored.')
        }}
      />
    </div>
  )
}
