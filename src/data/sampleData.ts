import type { AppSettings } from '@/types'

export const defaultSettings: AppSettings = {
  darkMode: false,
  demoDataLoaded: false,
  currency: 'INR',
  userName: '',
  studentMode: {
    enabled: false,
    monthlyAllowance: 0,
    hostelRent: 0,
    foodBudget: 0,
    transportBudget: 0,
    entertainmentBudget: 0,
    savingsTarget: 0,
    allowanceDay: 1,
  },
}
