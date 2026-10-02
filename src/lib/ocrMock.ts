import type {
  Category,
  OcrExtractedData,
  PaymentMethod,
} from '@/types'

/**
 * Mock OCR service — isolated so a real OCR API can replace this later.
 * Interface: extractFromImage(file) → Promise<OcrExtractedData>
 */
const MOCK_RECEIPTS: Array<Omit<OcrExtractedData, 'confidence'> & { keywords: string[] }> = [
  {
    keywords: ['swiggy', 'food', 'delivery'],
    merchant: 'Swiggy',
    amount: 438,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI' as PaymentMethod,
    category: 'Food' as Category,
  },
  {
    keywords: ['zomato'],
    merchant: 'Zomato',
    amount: 312,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI' as PaymentMethod,
    category: 'Food' as Category,
  },
  {
    keywords: ['uber', 'ola', 'rapido'],
    merchant: 'Uber',
    amount: 145,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI' as PaymentMethod,
    category: 'Transport' as Category,
  },
  {
    keywords: ['amazon', 'flipkart', 'myntra'],
    merchant: 'Amazon',
    amount: 1299,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Credit Card' as PaymentMethod,
    category: 'Shopping' as Category,
  },
  {
    keywords: ['netflix', 'spotify', 'prime'],
    merchant: 'Netflix',
    amount: 649,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI' as PaymentMethod,
    category: 'Subscriptions' as Category,
  },
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

export async function extractFromImage(
  file: File,
): Promise<OcrExtractedData> {
  // Simulate scanning delay
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 800))

  const name = file.name.toLowerCase()
  const matched = MOCK_RECEIPTS.find((m) =>
    m.keywords.some((k) => name.includes(k)),
  )

  if (matched) {
    const { keywords: _, ...data } = matched
    return { ...data, confidence: 0.82 + Math.random() * 0.15 }
  }

  // Deterministic mock from filename hash so it feels consistent
  const idx = hashName(name) % MOCK_RECEIPTS.length
  const pick = MOCK_RECEIPTS[idx]
  const variance = (hashName(name) % 200) - 50

  return {
    merchant: pick.merchant,
    amount: Math.max(50, pick.amount + variance),
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: pick.paymentMethod,
    category: pick.category,
    confidence: 0.68 + (hashName(name) % 20) / 100,
  }
}

export type OcrService = {
  extractFromImage: (file: File) => Promise<OcrExtractedData>
}

export const ocrService: OcrService = {
  extractFromImage,
}
