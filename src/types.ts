/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = "expense" | "income";

export type RecurringPeriod = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
  note?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringPeriod;
}

export interface CategorySpec {
  name: string;
  type: TransactionType | "both";
  iconName: string; // Lucide icon wrapper name
  color: string; // Tailwind bg- class
  textColor: string; // Tailwind text- class
}

export interface BudgetConfig {
  monthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  color: string; // Tailwind hex or class name
}

// Highly descriptive, human-readable list of standard financial categories
export const FINANCE_CATEGORIES: CategorySpec[] = [
  { name: "Food & Dining", type: "expense", iconName: "Utensils", color: "bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40", textColor: "text-amber-700 dark:text-amber-400" },
  { name: "Shopping", type: "expense", iconName: "ShoppingBag", color: "bg-sky-100 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40", textColor: "text-sky-700 dark:text-sky-400" },
  { name: "Transport", type: "expense", iconName: "Car", color: "bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40", textColor: "text-blue-700 dark:text-blue-400" },
  { name: "Housing & Rent", type: "expense", iconName: "Home", color: "bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40", textColor: "text-rose-700 dark:text-rose-400" },
  { name: "Entertainment", type: "expense", iconName: "Tv", color: "bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40", textColor: "text-purple-700 dark:text-purple-400" },
  { name: "Utilities & Bills", type: "expense", iconName: "Lightbulb", color: "bg-yellow-100 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900/40", textColor: "text-yellow-700 dark:text-yellow-400" },
  { name: "Healthcare", type: "expense", iconName: "HeartPulse", color: "bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40", textColor: "text-emerald-700 dark:text-emerald-400" },
  
  // Income
  { name: "Salary / Income", type: "income", iconName: "Briefcase", color: "bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-900/40", textColor: "text-green-700 dark:text-green-400" },
  { name: "Freelance / Business", type: "income", iconName: "Cpu", color: "bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40", textColor: "text-indigo-700 dark:text-indigo-400" },
  { name: "Investment", type: "income", iconName: "TrendingUp", color: "bg-teal-100 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40", textColor: "text-teal-700 dark:text-teal-400" },
  { name: "Gifts & Personal", type: "both", iconName: "Gift", color: "bg-fuchsia-100 dark:bg-fuchsia-950/40 border border-fuchsia-200 dark:border-fuchsia-900/40", textColor: "text-fuchsia-700 dark:text-fuchsia-400" },
  { name: "Others", type: "both", iconName: "PiggyBank", color: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700", textColor: "text-slate-700 dark:text-slate-300" },
];
