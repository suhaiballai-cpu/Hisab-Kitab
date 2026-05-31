/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, PiggyBank, Sparkles, Check, Trash2, Milestone, ArrowUpRight } from "lucide-react";
import { SavingsGoal } from "../types";

interface SavingsGoalsPanelProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, "id">) => void;
  onUpdateGoalProgress: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  currencySymbol: string;
}

export function SavingsGoalsPanel({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
  currencySymbol,
}: SavingsGoalsPanelProps) {
  // UI states
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // New goal form states
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalColor, setGoalColor] = useState("indigo");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Funds adjust states
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"deposit" | "withdraw">("deposit");

  const colors = [
    { value: "indigo", bg: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-150" },
    { value: "emerald", bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-150" },
    { value: "amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-150" },
    { value: "rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-150" },
    { value: "sky", bg: "bg-sky-500", text: "text-sky-500", border: "border-sky-150" },
  ];

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !goalTarget) return;

    onAddGoal({
      name: goalName.trim(),
      target: parseFloat(goalTarget),
      current: 0,
      deadline: goalDeadline || undefined,
      color: goalColor,
    });

    setGoalName("");
    setGoalTarget("");
    setGoalDeadline("");
    setShowAddGoal(false);
  };

  const handleAdjustFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !adjustAmount) return;

    const value = parseFloat(adjustAmount);
    const scale = adjustType === "deposit" ? value : -value;

    onUpdateGoalProgress(selectedGoalId, scale);
    setAdjustAmount("");
    setSelectedGoalId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Piggy-Bank Savings Milestones</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Track and allocate savings targets</p>
        </div>

        <button
          onClick={() => {
            setShowAddGoal(!showAddGoal);
            setSelectedGoalId(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-150 border border-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-150"
        >
          {showAddGoal ? "Close Form" : <span className="flex items-center gap-1">New Goal <ArrowUpRight className="w-3 h-3" /></span>}
        </button>
      </div>

      {/* Goal creation Form */}
      {showAddGoal && (
        <form onSubmit={handleCreateGoal} className="mb-4 p-4 border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">🆕 Create Savings Goal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-450 block mb-0.5">Goal Description</label>
              <input
                type="text"
                required
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Android Tablet, Emergency Fund"
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-450 block mb-0.5">Target Sum ({currencySymbol})</label>
              <input
                type="number"
                required
                min="1"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target Amount"
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-440 block mb-0.5">Deadline (Optional)</label>
              <input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-440 block mb-1">Color theme</label>
              <div className="flex gap-2 items-center h-8">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setGoalColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.bg} cursor-pointer transition-transform ${goalColor === c.value ? "scale-125 ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-slate-900" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">
              Add Target
            </button>
          </div>
        </form>
      )}

      {/* Goal adjust Modal/Block */}
      {selectedGoalId && (
        <form onSubmit={handleAdjustFundsSubmit} className="mb-4 p-4 border border-purple-100 dark:border-purple-950 bg-purple-50/10 rounded-2xl space-y-3">
          {(() => {
            const goal = goals.find((g) => g.id === selectedGoalId);
            return (
              <>
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">
                    💸 Allocate funds to <span className="underline">{goal?.name}</span>
                  </h4>
                  <button type="button" onClick={() => setSelectedGoalId(null)} className="text-slate-400 hover:text-slate-650">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-440 block mb-0.5">Allocation Mode</label>
                    <div className="flex bg-white dark:bg-slate-950 border border-slate-150 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setAdjustType("deposit")}
                        className={`flex-1 py-1 text-center font-bold text-[11px] rounded-lg ${adjustType === "deposit" ? "bg-emerald-50 text-emerald-600" : "text-slate-400"}`}
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustType("withdraw")}
                        className={`flex-1 py-1 text-center font-bold text-[11px] rounded-lg ${adjustType === "withdraw" ? "bg-rose-50 text-rose-600" : "text-slate-400"}`}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-440 block mb-0.5">Deposit Value ({currencySymbol})</label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.01"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="Sum to modify"
                      className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all mt-1"
                >
                  Adjust Saved Balance
                </button>
              </>
            );
          })()}
        </form>
      )}

      {/* Goal list Grid */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/20">
            <Milestone className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400">No active savings milestones set.</p>
            <p className="text-[10px] text-slate-350 mt-1">Keep yourself motivated by establishing specific targets!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((g) => {
              const fraction = g.target > 0 ? g.current / g.target : 0;
              const percent = Math.min(100, Math.max(0, Math.round(fraction * 100)));
              const themeColor = colors.find((c) => c.value === g.color) || colors[0];

              return (
                <div
                  key={g.id}
                  className="p-4 border border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 rounded-2xl transition-all duration-150 relative space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 truncate leading-tight">
                        {g.name}
                      </h4>
                      {g.deadline && (
                        <p className="text-[10px] text-slate-400 mt-0.5">By {g.deadline}</p>
                      )}
                    </div>

                    <div className="flex gap-1 items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="text-slate-350 hover:text-rose-500 p-1 rounded-md"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progressive Meter */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <span>{percent}% Save Ratio</span>
                      <span className="text-slate-400">
                        {currencySymbol}
                        {g.current.toFixed(0)} / {currencySymbol}
                        {g.target.toFixed(0)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${themeColor.bg} rounded-full transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setSelectedGoalId(g.id);
                        setAdjustAmount("");
                      }}
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 rounded-xl text-[11px] font-bold border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 transition-all duration-150"
                    >
                      <PiggyBank className="w-3.5 h-3.5" /> Direct Allocation (Deposit/Withdrawal)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
