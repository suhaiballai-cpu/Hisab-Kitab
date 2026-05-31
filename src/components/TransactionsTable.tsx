/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Search, Filter, Trash2, Edit3, X, ChevronDown, ChevronUp, Calendar, Tag, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Transaction, FINANCE_CATEGORIES, RecurringPeriod } from "../types";
import { CategoryIcon } from "./CategoryIcon";

interface TransactionsTableProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onEditTransaction: (id: string, updated: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  currencySymbol: string;
}

export function TransactionsTable({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  currencySymbol,
}: TransactionsTableProps) {
  // Search and filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Manual Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Input States
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Food & Dining");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [recurring, setRecurring] = useState<RecurringPeriod>("none");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food & Dining");
    setDate(new Date().toISOString().split("T")[0]);
    setRecurring("none");
    setNote("");
    setEditingId(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const dataValue = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      note: note.trim() || undefined,
      isRecurring: recurring !== "none",
      recurringInterval: recurring,
    };

    if (editingId) {
      onEditTransaction(editingId, dataValue);
    } else {
      onAddTransaction(dataValue);
    }

    resetForm();
    setShowAddForm(false);
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setTitle(t.title);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setRecurring(t.recurringInterval || "none");
    setNote(t.note || "");
    setShowAddForm(true);
  };

  // Filter & Sort core logic
  const filteredTransactions = transactions
    .filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.note || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchCat = catFilter === "all" || t.category === catFilter;
      return matchSearch && matchType && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* List Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Ledger History</span>
            <span className="text-xs font-normal bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-450 px-2 py-0.5 rounded-full">
              {filteredTransactions.length} item{filteredTransactions.length !== 1 && "s"}
            </span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">View and update daily logs</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all duration-150"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAddForm ? "Close Form" : "Add Manually"}
        </button>
      </div>

      {/* Manual Input Form */}
      {showAddForm && (
        <form onSubmit={handleManualSubmit} className="mb-6 p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 rounded-2xl space-y-3 transition-all duration-200">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {editingId ? "✏️ Edit Transaction Record" : "✏️ Express New Transaction"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Title / Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grocery Shop, Freelance project"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Amount ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Type</label>
              <div className="flex gap-1.5 p-1 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${type === "expense" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" : "text-slate-450 hover:bg-slate-50"}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    // Auto-set matching category helper
                    if (category === "Food & Dining") setCategory("Salary / Income");
                  }}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${type === "income" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "text-slate-450 hover:bg-slate-50"}`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              >
                {FINANCE_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Logging Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Set Recurring</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringPeriod)}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              >
                <option value="none">One-time payment</option>
                <option value="daily">Daily schedule</option>
                <option value="weekly">Weekly schedule</option>
                <option value="monthly">Monthly schedule</option>
                <option value="yearly">Yearly schedule</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block dark:text-slate-500 mb-1">Optional Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Starbucks, cash receipt"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-850 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {editingId ? "Save Changes" : "Book Transaction"}
            </button>
          </div>
        </form>
      )}

      {/* Grid Filtering Controls */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box with Icon */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by note or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Sorter Selector */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-300 focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High-Low</option>
              <option value="amount-asc">Amount: Low-High</option>
            </select>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-300 focus:outline-none max-w-[120px] truncate"
            >
              <option value="all">Category: All</option>
              {FINANCE_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Filters for Type */}
        <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
          {(["all", "expense", "income"] as const).map((typeVal) => (
            <button
              key={typeVal}
              onClick={() => setTypeFilter(typeVal)}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all capitalize ${typeFilter === typeVal ? "bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-450 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              {typeVal === "all" ? "All Logs" : typeVal === "expense" ? "Expenses" : "Income"}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-250">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10">
            <p className="text-xs text-slate-400">No transactions match your terms.</p>
            <p className="text-[10px] text-slate-350 mt-1">Try relaxing filters or log a prompt using financial AI!</p>
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const spec = FINANCE_CATEGORIES.find((c) => c.name === t.category);
            return (
              <div
                key={t.id}
                className="group p-3 border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 rounded-2xl transition-all duration-150 flex items-center gap-3"
              >
                {/* Visual Category Icon */}
                <div className={`p-2.5 rounded-xl ${spec?.color || "bg-slate-100 text-slate-700"} flex-shrink-0 flex items-center justify-center`}>
                  <CategoryIcon name={spec?.iconName || "PiggyBank"} className="w-5 h-5" />
                </div>

                {/* Left Description Side */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-150 truncate leading-tight">
                      {t.title}
                    </p>
                    {t.isRecurring && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-150/40 px-1 py-0.2 rounded-md" title={`Repeats ${t.recurringInterval}`}>
                        <Clock className="w-2.5 h-2.5" />
                        <span className="capitalize">{t.recurringInterval}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{t.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {t.date}
                    </span>
                  </p>

                  {t.note && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 truncate bg-slate-50/60 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                      {t.note}
                    </p>
                  )}
                </div>

                {/* Right Amount Side */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-extrabold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-450"}`}>
                    {t.type === "income" ? "+" : "-"}
                    {currencySymbol}
                    {t.amount.toFixed(2)}
                  </span>

                  {/* Actions Drawer */}
                  <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
