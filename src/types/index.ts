export type TransactionType = 'income' | 'expense'

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Hostel/Rent'
  | 'Subscriptions'
  | 'Travel'
  | 'Other'
  | 'Income'

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Wallet'
  | 'Other'

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: Category
  merchant: string
  date: string // ISO date YYYY-MM-DD
  paymentMethod: PaymentMethod
  notes?: string
  isDemo?: boolean
}

export interface Budget {
  id: string
  category: Category
  amount: number
  month: string // YYYY-MM
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  saved: number
  emoji?: string
  deadline?: string
  createdAt: string
}

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  category: Category
  frequency: RecurringFrequency
  nextPaymentDate: string
  paymentMethod?: PaymentMethod
}

export interface StudentModeSettings {
  enabled: boolean
  monthlyAllowance: number
  hostelRent: number
  foodBudget: number
  transportBudget: number
  entertainmentBudget: number
  savingsTarget: number
  allowanceDay: number // day of month
}

export interface AppSettings {
  darkMode: boolean
  studentMode: StudentModeSettings
  demoDataLoaded: boolean
  currency: 'INR'
  userName: string
}

export interface OcrExtractedData {
  merchant: string
  amount: number
  date: string
  paymentMethod: PaymentMethod
  category: Category
  confidence: number
}

export interface MoneyLeakInsight {
  id: string
  title: string
  description: string
  amount?: number
  previousAmount?: number
  changePercent?: number
  category?: Category
  type: 'frequency' | 'increase' | 'micro' | 'merchant' | 'recurring'
  transactionIds: string[]
}

export interface SmartInsight {
  id: string
  message: string
  type: 'info' | 'positive' | 'warning'
}

export type WhatIfScenario =
  | { type: 'reduce_weekly'; category: Category; amount: number }
  | { type: 'save_monthly'; amount: number }
  | { type: 'cancel_subscription'; amount: number }
  | { type: 'income_increase'; amount: number }

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Health',
  'Hostel/Rent',
  'Subscriptions',
  'Travel',
  'Other',
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Wallet',
  'Other',
]

export const STORAGE_KEYS = {
  transactions: 'mc_transactions',
  budgets: 'mc_budgets',
  goals: 'mc_goals',
  recurring: 'mc_recurring',
  settings: 'mc_settings',
} as const
