/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Brain, Sparkles, RefreshCw, Send, HelpCircle, CheckCircle } from "lucide-react";
import { Transaction, SavingsGoal } from "../types";
import ReactMarkdown from "react-markdown";

interface BudgetCounselorProps {
  transactions: Transaction[];
  monthlyLimit: number;
  goals: SavingsGoal[];
  selectedMonth: string;
}

export function BudgetCounselor({
  transactions,
  monthlyLimit,
  goals,
  selectedMonth,
}: BudgetCounselorProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encouragingMessageIdx, setEncouragingMessageIdx] = useState(0);

  const quotes = [
    "Compiling transaction values...",
    "Scanning categories for potential savings opportunities...",
    "Comparing progress metrics with target deadlines...",
    "Calibrating personalized suggestions for you...",
    "Structuring financial insights ledger...",
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setEncouragingMessageIdx((prev) => (prev + 1) % quotes.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          budget: monthlyLimit || undefined,
          goals,
          selectedMonth,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to contact AI Advisor. Please verify that server is active.");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setInsights(result.insights);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while analyzing savings trends.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 shadow-lg relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-indigo-500/10 via-transparent to-transparent flex-shrink-0 -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Personal AI Budget Companion</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Flash 3.5</span>
            </h2>
            <p className="text-xs text-slate-400">Contextual financial health audits and custom savings advice</p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 disabled:from-indigo-650 disabled:to-indigo-600 text-white hover:opacity-90 rounded-xl text-xs font-bold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isLoading ? "Analyzing..." : "Generate Analysis"}
        </button>
      </div>

      {/* Main Insights Content Area */}
      {isLoading ? (
        <div className="relative py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-350">{quotes[encouragingMessageIdx]}</p>
            <p className="text-[11px] text-slate-500">Wait a few moments while we consult with financial AI</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-indigo-950/20 border border-indigo-900 text-indigo-400 rounded-2xl text-xs leading-relaxed">
          <span className="font-bold">Error compiling records:</span> {error}
        </div>
      ) : insights ? (
        <div className="bg-slate-950/45 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[380px] scrollbar-thin">
          <div className="markdown-body space-y-3 prose prose-invert prose-xs">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-850/50 flex align-middle justify-between">
            <span className="text-[9px] text-slate-550 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Generated live for your current ledger configuration
            </span>
            <button
              onClick={generateInsights}
              className="text-[10px] text-indigo-450 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Report
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/15">
          <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-350">Insights are waiting for your active trigger.</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            Click &apos;Generate Analysis&apos; to submit your currently logged transaction books and budget limits for a tailored AI counseling report!
          </p>
        </div>
      )}
    </div>
  );
}
