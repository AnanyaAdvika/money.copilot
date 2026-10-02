<<<<<<< HEAD
# Money Copilot

A modern personal expense tracker built for **college students and young adults in India**.

Track spending in ₹, catch money leaks, simulate what-ifs, scan UPI screenshots, and ask “Can I afford this?” — all client-side with LocalStorage.

## Features

- **Dashboard** — balance, income, expenses, savings, charts, student allowance tracker
- **Transactions** — add / edit / delete, search, filter, sort, CSV export
- **Analytics** — monthly trends, category & payment breakdowns, MoM changes
- **Budgets** — category limits with progress states (normal → exceeded)
- **Savings Goals** — progress, add money, estimated completion
- **Recurring Expenses** — subscriptions, hostel, gym with monthly totals
- **Calendar** — day-level spending view
- **Scan Receipt / UPI** — mock OCR flow (API-ready architecture)
- **Money Leak Detector** — pattern insights from real transaction data
- **What-If Simulator** — live charts for spending / savings scenarios
- **Can I Afford This?** — purchase impact vs balance, budgets & goals
- **Student Mode** — allowance, remaining days, suggested daily spend
- **Dark mode** + responsive sidebar / mobile nav

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS v4
- Recharts
- Lucide React
- LocalStorage persistence

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # preview production build
```

## Demo data

First launch loads realistic Indian student demo data (Swiggy, Zomato, Uber, Netflix, hostel, etc.). Clear or reload it anytime from **Settings**.

## Project structure

```
src/
  components/   # layout, UI primitives, transactions
  context/      # app state + toasts
  data/         # sample demo dataset
  lib/          # calculations, leaks, what-if, OCR mock, storage
  pages/        # all app screens
  types/        # shared TypeScript models
```

## Note

All insights and affordability numbers are **calculations from your data**, not financial advice.
=======
# Money-Copilot
Personal Expense Tracker App
>>>>>>> 40a225a8673822ad4444a1c6a12579ee08bf0107
