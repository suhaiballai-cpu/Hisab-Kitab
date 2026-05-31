/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Coins,
  TrendingDown,
  TrendingUp,
  Settings,
  AlertTriangle,
  Flame,
  Info,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { Transaction, SavingsGoal, FINANCE_CATEGORIES } from "./types";
import { AIDashboard } from "./components/AIDashboard";
import { TransactionsTable } from "./components/TransactionsTable";
import { SavingsGoalsPanel } from "./components/SavingsGoalsPanel";
import { BudgetCounselor } from "./components/BudgetCounselor";
import { ExportImportBackup } from "./components/ExportImportBackup";

// Import Recharts components safely
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CURRENT_MONTH_STR = "May 2026";

// Initial visual state if LocalStorage is empty
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    title: "Monthly Salary Income",
    amount: 3500.00,
    type: "income",
    category: "Salary / Income",
    date: "2026-05-01",
    isRecurring: true,
    recurringInterval: "monthly",
    note: "Primary paycheck",
  },
  {
    id: "tx-2",
    title: "Apartment Housing Lease Rent",
    amount: 1100.00,
    type: "expense",
    category: "Housing & Rent",
    date: "2026-05-01",
    isRecurring: true,
    recurringInterval: "monthly",
    note: "Bank standing auto-draft order",
  },
  {
    id: "tx-3",
    title: "Costco Grocery Shopping",
    amount: 145.20,
    type: "expense",
    category: "Food & Dining",
    date: "2026-05-08",
    note: "Weekly groceries batch",
  },
  {
    id: "tx-4",
    title: "Weekly Gasoline Petrol",
    amount: 45.00,
    type: "expense",
    category: "Transport",
    date: "2026-05-15",
  },
  {
    id: "tx-5",
    title: "Sushi dinner with friends",
    amount: 62.80,
    type: "expense",
    category: "Food & Dining",
    date: "2026-05-18",
    note: "Parsed by AI",
  },
  {
    id: "tx-6",
    title: "Freelance Landing Page Contract",
    amount: 650.00,
    type: "income",
    category: "Freelance / Business",
    date: "2026-05-22",
    note: "Delivered Figma templates",
  },
  {
    id: "tx-7",
    title: "Netflix Streaming Plan",
    amount: 15.99,
    type: "expense",
    category: "Entertainment",
    date: "2026-05-24",
    isRecurring: true,
    recurringInterval: "monthly",
  },
  {
    id: "tx-8",
    title: "Gym membership subscription",
    amount: 40.00,
    type: "expense",
    category: "Healthcare",
    date: "2021-05-25",
  }
];

const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: "goal-1",
    name: "Android Tablet Target",
    target: 500,
    current: 150,
    deadline: "2026-08-30",
    color: "indigo",
  },
  {
    id: "goal-2",
    name: "Emergency Cushon Reserve",
    target: 2000,
    current: 600,
    color: "emerald",
  }
];

export default function App() {
  // Local ledger persistent storage states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(2000);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize and load ledger
  useEffect(() => {
    const prevTx = localStorage.getItem("expense_ledger_transactions");
    const prevGoals = localStorage.getItem("expense_ledger_goals");
    const prevLimit = localStorage.getItem("expense_ledger_limit");
    const prevCurrency = localStorage.getItem("expense_ledger_currency");

    if (prevTx) setTransactions(JSON.parse(prevTx));
    else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem("expense_ledger_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (prevGoals) setGoals(JSON.parse(prevGoals));
    else {
      setGoals(INITIAL_GOALS);
      localStorage.setItem("expense_ledger_goals", JSON.stringify(INITIAL_GOALS));
    }

    if (prevLimit) setMonthlyLimit(Number(prevLimit));
    if (prevCurrency) setCurrencySymbol(prevCurrency);
  }, []);

  // Save on modifications helper
  const updateTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    localStorage.setItem("expense_ledger_transactions", JSON.stringify(newTx));
  };

  const updateGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem("expense_ledger_goals", JSON.stringify(newGoals));
  };

  const handleUpdateLimit = (val: number) => {
    setMonthlyLimit(val);
    localStorage.setItem("expense_ledger_limit", val.toString());
  };

  const handleUpdateCurrency = (symbol: string) => {
    setCurrencySymbol(symbol);
    localStorage.setItem("expense_ledger_currency", symbol);
  };

  // State transaction actions
  const handleAddTransaction = (item: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...item,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    updateTransactions([newTx, ...transactions]);
  };

  const handleEditTransaction = (id: string, updated: Partial<Transaction>) => {
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return;
    const items = [...transactions];
    items[index] = { ...items[index], ...updated };
    updateTransactions(items);
  };

  const handleDeleteTransaction = (id: string) => {
    const filtered = transactions.filter((t) => t.id !== id);
    updateTransactions(filtered);
  };

  // State Savings Goals actions
  const handleAddGoal = (newItem: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = {
      ...newItem,
      id: `goal-${Date.now()}`,
    };
    updateGoals([...goals, newGoal]);
  };

  const handleUpdateGoalProgress = (id: string, delta: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          current: Math.max(0, g.current + delta),
        };
      }
      return g;
    });
    updateGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    updateGoals(updated);
  };

  const handleImportData = (imported: {
    transactions: Transaction[];
    goals: SavingsGoal[];
    monthlyLimit: number;
    currencySymbol: string;
  }) => {
    setTransactions(imported.transactions);
    setGoals(imported.goals);
    setMonthlyLimit(imported.monthlyLimit);
    setCurrencySymbol(imported.currencySymbol);

    localStorage.setItem("expense_ledger_transactions", JSON.stringify(imported.transactions));
    localStorage.setItem("expense_ledger_goals", JSON.stringify(imported.goals));
    localStorage.setItem("expense_ledger_limit", imported.monthlyLimit.toString());
    localStorage.setItem("expense_ledger_currency", imported.currencySymbol);
  };

  // Calculations for current selected month (May 2026)
  const currentMonthTx = transactions; // Default to all, but can slice
  const incomeTx = currentMonthTx.filter((t) => t.type === "income");
  const expenseTx = currentMonthTx.filter((t) => t.type === "expense");

  const totalIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / monthlyLimit) * 100));

  // Visual highlights for budgets
  const getBudgetMeterColor = () => {
    if (budgetUsagePercent >= 90) return "bg-rose-500";
    if (budgetUsagePercent >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Analytics helper maps
  // Extract daily totals for visual caching
  const getAreaChartData = () => {
    const dailyMap: Record<string, { date: string; income: number; expense: number }> = {};
    
    // Default mock grid dates for visualization
    const days = Array.from({ length: 31 }, (_, i) => {
      const d = i + 1;
      return `2026-05-${d < 10 ? "0" + d : d}`;
    });

    days.forEach((dayStr) => {
      dailyMap[dayStr] = { date: dayStr.slice(8), income: 0, expense: 0 };
    });

    currentMonthTx.forEach((tx) => {
      // ignore other years/months for this daily line graph visualization layout
      if (tx.date.startsWith("2026-05") && dailyMap[tx.date]) {
        if (tx.type === "income") {
          dailyMap[tx.date].income += tx.amount;
        } else {
          dailyMap[tx.date].expense += tx.amount;
        }
      }
    });

    return Object.values(dailyMap);
  };

  const getPieChartData = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenseTx.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const pieData = getPieChartData();
  const areaData = getAreaChartData();

  // Color palette matching FINANCE_CATEGORIES specs
  const PIE_COLORS = [
    "#f59e0b", // Amber
    "#0ea5e9", // Sky Blue
    "#3b82f6", // Royal Blue
    "#f43f5e", // Rose Red
    "#a855f7", // Purple
    "#eab308", // Yellow
    "#10b981", // Emerald
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#d946ef", // Fuchsia
    "#64748b", // Slate grey
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100 dark:shadow-none">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex items-center gap-1.5">
                <span>Pocket Ledger</span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Mobile-First</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Android free & offline finance utility</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl">
              📅 {CURRENT_MONTH_STR}
            </span>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-350 border border-slate-150/40 dark:border-slate-800 rounded-xl transition-all"
              title="Ledger Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Settings block drawer */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-5 mt-2 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450">⚙️ Control preferences</h3>
                <button onClick={() => setSettingsOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close Settings</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Set Active Currency Icon</label>
                  <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {["$", "€", "£", "¥", "₹"].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => handleUpdateCurrency(sym)}
                        className={`flex-1 py-1 text-center font-bold text-sm rounded-lg transition-all ${currencySymbol === sym ? "bg-white dark:bg-slate-800 text-purple-600 shadow-sm" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-BLOCK text-slate-400 mb-1 block">Set Monthly Expenditure Target Expense Cap</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="250"
                      value={monthlyLimit}
                      onChange={(e) => handleUpdateLimit(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="font-extrabold text-sm min-w-[70px] bg-slate-50 border p-2 dark:bg-slate-900 dark:border-slate-850 rounded-xl text-center">
                      {currencySymbol}{monthlyLimit}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Balance KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: capital Available */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Available Capital Balance</p>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1 leading-none">
                {currencySymbol}
                {netBalance.toFixed(2)}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                <span>Calculated over total books</span>
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Total Income Received</p>
              <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 leading-none">
                {currencySymbol}
                {totalIncome.toFixed(2)}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                Across {incomeTx.length} deposits
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Expense */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Cumulative Expenditures</p>
              <h2 className="text-2xl font-extrabold text-rose-600 dark:text-rose-450 tracking-tight mt-1 leading-none">
                {currencySymbol}
                {totalExpense.toFixed(2)}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                Across {expenseTx.length} billing items
              </p>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-550 dark:text-rose-400 rounded-2xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* Cap allocation alerts bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
              <span>Expenditure Budget Cap Usage Tracker</span>
              {budgetUsagePercent > 90 && (
                <span className="flex items-center gap-0.5 text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded-full uppercase">
                  <AlertTriangle className="w-2.5 h-2.5" /> High Risk
                </span>
              )}
            </span>
            <span className="text-slate-450 dark:text-slate-500">
              {budgetUsagePercent}% Consumed ({currencySymbol}{totalExpense.toFixed(0)} of {currencySymbol}{monthlyLimit})
            </span>
          </div>
          <div className="w-full h-3 bg-slate-55 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${getBudgetMeterColor()} rounded-full transition-all duration-300`}
              style={{ width: `${budgetUsagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Segmented layout grids */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CHUNKS (Col length = 5) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            
            {/* AI Natural Language Logger */}
            <AIDashboard onAddTransaction={handleAddTransaction} currencySymbol={currencySymbol} />
            
            {/* Visual analytics bento blocks inside LHS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Ledger Visual Analytics</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Categorical breakdown & flow logs</p>
              </div>

              {expenseTx.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">Allocate some expenses to draw visual pie-breakdowns!</p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="w-full h-[180px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${currencySymbol}${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend breakdown list */}
                  <div className="space-y-1 w-full max-h-[140px] overflow-y-auto pr-1">
                    {pieData.slice(0, 5).map((d, index) => (
                      <div key={d.name} className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="text-slate-650 dark:text-slate-300 truncate">{d.name}</span>
                        </div>
                        <span className="text-slate-450 flex-shrink-0">{currencySymbol}{d.value.toFixed(0)}</span>
                      </div>
                    ))}
                    {pieData.length > 5 && (
                      <p className="text-[9px] text-slate-400 text-right">+ {pieData.length - 5} more categories</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Savings Milestones */}
            <SavingsGoalsPanel
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
              currencySymbol={currencySymbol}
            />

          </div>

          {/* RIGHT CHUNKS (Col length = 7) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* Core Ledger Tables */}
            <TransactionsTable
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              currencySymbol={currencySymbol}
            />

            {/* AI Advisor Assistant Chat */}
            <BudgetCounselor
              transactions={transactions}
              monthlyLimit={monthlyLimit}
              goals={goals}
              selectedMonth={CURRENT_MONTH_STR}
            />

          </div>

        </section>

        {/* Daily Cashflow Trend Line Graph */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">{CURRENT_MONTH_STR} Flows Grid</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Real-time daily flow trends (Area breakdown)</p>
          </div>

          <div className="w-full h-[180px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="areaColorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaColorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: any) => `${currencySymbol}${value}`} />
                <Area
                  type="monotone"
                  name="Daily Income"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaColorIncome)"
                />
                <Area
                  type="monotone"
                  name="Daily Expense"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaColorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Offline Backup Restore utility footer panel */}
        <ExportImportBackup
          transactions={transactions}
          goals={goals}
          monthlyLimit={monthlyLimit}
          currencySymbol={currencySymbol}
          onImportBackup={handleImportData}
        />

      </main>

      <footer className="py-8 text-center text-slate-400 dark:text-slate-600 text-xs mt-12 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <p className="font-bold flex items-center justify-center gap-1">
          <span>Daily Expense and Income Tracker Ledger</span>
          <span>•</span>
          <span className="text-purple-600 dark:text-purple-400">100% Free & Secured</span>
        </p>
        <p className="mt-1 font-medium">All database files are persisted locally inside Sandbox storage.</p>
      </footer>
    </div>
  );
}
