import { TransactionForm } from '@/components/transactions/TransactionForm'
import { PageHeader } from '@/components/common/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { ocrService } from '@/lib/ocrMock'
import type { OcrExtractedData, Transaction } from '@/types'
import { formatINR } from '@/lib/utils'
import { ImagePlus, ScanLine, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'

type Stage = 'idle' | 'scanning' | 'review'

export function ScanPage() {
  const { addTransaction } = useApp()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<OcrExtractedData | null>(null)

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setStage('scanning')
    try {
      const data = await ocrService.extractFromImage(file)
      setExtracted(data)
      setStage('review')
    } catch {
      toast('Could not read the image. Try again.', 'error')
      setStage('idle')
    }
  }

  const reset = () => {
    setStage('idle')
    setPreview(null)
    setExtracted(null)
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <PageHeader
        title="Scan Receipt / UPI Screenshot"
        subtitle="Upload a receipt or UPI screenshot — we'll extract the details for you to confirm. (Mock OCR for now; ready for a real API later.)"
      />

      {stage === 'idle' && (
        <Card>
          <CardBody>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 transition hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg">
                <ImagePlus className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-semibold">
                  Scan Receipt / UPI Screenshot
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  PNG, JPG up to ~10MB. Tip: name the file with the merchant (e.g. swiggy.png)
                  for smarter mock extraction.
                </p>
              </div>
              <Button type="button" variant="accent">
                <ScanLine className="h-4 w-4" /> Choose Image
              </Button>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFile(file)
              }}
            />
          </CardBody>
        </Card>
      )}

      {stage === 'scanning' && (
        <Card>
          <CardBody className="py-16 text-center space-y-4">
            {preview && (
              <img
                src={preview}
                alt="Upload preview"
                className="mx-auto max-h-48 rounded-xl object-contain opacity-80"
              />
            )}
            <div className="mx-auto h-1.5 w-48 rounded-full bg-teal-200 overflow-hidden">
              <div className="h-full w-full bg-teal-600 animate-scan-line origin-center" />
            </div>
            <p className="font-display font-semibold text-lg">Scanning your screenshot…</p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Extracting merchant, amount, date & payment method
            </p>
          </CardBody>
        </Card>
      )}

      {stage === 'review' && extracted && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white px-5 py-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <div>
                <p className="font-semibold">Extracted details</p>
                <p className="text-xs text-teal-100">
                  Confidence {Math.round(extracted.confidence * 100)}% — edit anything before
                  confirming
                </p>
              </div>
            </div>
            <CardBody className="grid sm:grid-cols-2 gap-3 text-sm">
              {preview && (
                <img
                  src={preview}
                  alt="Receipt"
                  className="sm:row-span-3 max-h-40 rounded-xl object-cover border border-[var(--color-border)]"
                />
              )}
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                <p className="text-xs text-[var(--color-ink-muted)]">Merchant</p>
                <p className="font-semibold">{extracted.merchant}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                <p className="text-xs text-[var(--color-ink-muted)]">Amount</p>
                <p className="font-semibold">{formatINR(extracted.amount)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 sm:col-span-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-[var(--color-ink-muted)]">Date</p>
                  <p className="font-medium">{extracted.date}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-ink-muted)]">Payment</p>
                  <p className="font-medium">{extracted.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-ink-muted)]">Category</p>
                  <p className="font-medium">{extracted.category}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="font-display font-semibold mb-4">Confirm & edit</h3>
              <TransactionForm
                initial={{
                  amount: extracted.amount,
                  type: 'expense',
                  category: extracted.category,
                  merchant: extracted.merchant,
                  date: extracted.date,
                  paymentMethod: extracted.paymentMethod,
                  notes: 'Added via receipt scan',
                }}
                submitLabel="Confirm & Add Expense"
                onCancel={reset}
                onSubmit={(data: Omit<Transaction, 'id'>) => {
                  addTransaction(data)
                  toast('Expense added successfully.')
                  reset()
                }}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
