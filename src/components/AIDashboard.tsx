/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Check, Edit2, CornerDownLeft, RefreshCcw } from "lucide-react";
import { Transaction, FINANCE_CATEGORIES } from "../types";
import { CategoryIcon } from "./CategoryIcon";

interface AIDashboardProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  currencySymbol: string;
}

export function AIDashboard({ onAddTransaction, currencySymbol }: AIDashboardProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedItem, setParsedItem] = useState<Omit<Transaction, "id"> & { confidence?: number, explanation?: string } | null>(null);
  const [isEditingParsed, setIsEditingParsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    "Dinner with family 42.50 at Olive Garden",
    "Received salary of 3200 today",
    "Spent 65 on electricity bill yesterday",
    "Earned 150 from selling old camera",
  ];

  const handleAIMagicParse = async (phrase: string) => {
    if (!phrase.trim()) return;
    setIsLoading(true);
    setError(null);
    setParsedItem(null);
    setIsEditingParsed(false);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: phrase,
          currentDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach financial AI analyzer server.");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setParsedItem({
        amount: result.amount || 0,
        type: result.type === "income" ? "income" : "expense",
        category: result.category || "Others",
        title: result.title || "Untitled AI Record",
        date: result.date || new Date().toISOString().split("T")[0],
        explanation: result.explanation || "Extracted transaction details.",
        confidence: result.confidence || 0.8,
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong while understanding your phrase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLog = () => {
    if (!parsedItem) return;
    onAddTransaction({
      amount: parsedItem.amount,
      type: parsedItem.type,
      category: parsedItem.category,
      title: parsedItem.title,
      date: parsedItem.date,
      note: parsedItem.explanation,
    });
    setParsedItem(null);
    setInputText("");
    setIsEditingParsed(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-xl text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">AI Instant Logging</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Type what you spent or earned naturally</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAIMagicParse(inputText);
        }}
        className="relative"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='e.g., "taxi ride for $18.50 yesterday" or "30 profit today from sales"'
          className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100 transition-all duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
          disabled={isLoading || !inputText.trim()}
          title="Parse Transaction"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>

      {/* Dynamic Suggestions */}
      {!parsedItem && !isLoading && (
        <div className="mt-3">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Try quick logging prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(phrase);
                  handleAIMagicParse(phrase);
                }}
                className="text-[12px] px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-650 dark:text-slate-300 rounded-full transition-all duration-150 text-left line-clamp-1"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton Animation */}
      {isLoading && (
        <div className="mt-4 p-4 border border-purple-100 dark:border-purple-950/40 bg-purple-50/10 dark:bg-purple-950/5 rounded-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/50"></div>
            <div className="flex-1 space-y-1.5">
              <div className="w-1/3 h-3 bg-purple-200 dark:bg-purple-900/50 rounded"></div>
              <div className="w-2/3 h-4 bg-purple-200 dark:bg-purple-900/50 rounded"></div>
            </div>
          </div>
          <div className="mt-3 w-1/2 h-3 bg-purple-200 dark:bg-purple-900/55 rounded-full"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-650 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
          <span className="font-semibold">Oops:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Parsed Result Edit & Confirmation Cards */}
      {parsedItem && !isLoading && (
        <div className="mt-4 p-4 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5 rounded-2xl transition-all duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              AI EXTRACED ({Math.round((parsedItem.confidence || 0.8) * 100)}% match)
            </span>
            <button
              type="button"
              onClick={() => setIsEditingParsed(!isEditingParsed)}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg transition-colors"
              title="Edit parameters"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingParsed ? (
            <div className="space-y-2 text-xs mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block dark:text-slate-500 mb-0.5">Description Title</label>
                  <input
                    type="text"
                    value={parsedItem.title}
                    onChange={(e) => setParsedItem({ ...parsedItem, title: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block dark:text-slate-500 mb-0.5">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="any"
                    value={parsedItem.amount}
                    onChange={(e) => setParsedItem({ ...parsedItem, amount: Number(e.target.value) })}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block dark:text-slate-500 mb-0.5">Transaction Type</label>
                  <select
                    value={parsedItem.type}
                    onChange={(e) => setParsedItem({ ...parsedItem, type: e.target.value as any })}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block dark:text-slate-500 mb-0.5">Category</label>
                  <select
                    value={parsedItem.category}
                    onChange={(e) => setParsedItem({ ...parsedItem, category: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                  >
                    {FINANCE_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block dark:text-slate-500 mb-0.5">Resolved Date</label>
                <input
                  type="date"
                  value={parsedItem.date}
                  onChange={(e) => setParsedItem({ ...parsedItem, date: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-2xl flex-shrink-0">
                {(() => {
                  const spec = FINANCE_CATEGORIES.find((c) => c.name === parsedItem.category);
                  return <CategoryIcon name={spec?.iconName || "PiggyBank"} className="w-5 h-5" />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-150 truncate leading-tight">{parsedItem.title}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{parsedItem.category}</span>
                  <span>•</span>
                  <span>{parsedItem.date}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${parsedItem.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {parsedItem.type === "income" ? "+" : "-"}
                  {currencySymbol}
                  {parsedItem.amount.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{parsedItem.type}</p>
              </div>
            </div>
          )}

          {parsedItem.explanation && !isEditingParsed && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900 leading-relaxed">
              💡 {parsedItem.explanation}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleConfirmLog}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-150 dark:shadow-none"
            >
              <Check className="w-3.5 h-3.5" /> Book Transaction
            </button>
            <button
              type="button"
              onClick={() => {
                setParsedItem(null);
                setInputText("");
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
