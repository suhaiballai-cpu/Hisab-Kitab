/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { Download, Upload, RefreshCw, FileCheck, HelpCircle, CheckCircle } from "lucide-react";
import { Transaction, SavingsGoal } from "../types";

interface ExportImportBackupProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  monthlyLimit: number;
  currencySymbol: string;
  onImportBackup: (data: {
    transactions: Transaction[];
    goals: SavingsGoal[];
    monthlyLimit: number;
    currencySymbol: string;
  }) => void;
}

export function ExportImportBackup({
  transactions,
  goals,
  monthlyLimit,
  currencySymbol,
  onImportBackup,
}: ExportImportBackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExportBackup = () => {
    try {
      const backupData = {
        app_id: "daily-expense-income-tracker-backup",
        version: "1.0",
        date: new Date().toISOString(),
        monthlyLimit,
        currencySymbol,
        transactions,
        goals,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const cleanDate = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `daily-expense-income-ledger-backup-${cleanDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMsg("Backup downloaded successfully to your device!");
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg("Failed to assemble JSON backup file.");
      setSuccessMsg(null);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Structure sanity checks
        if (
          !Array.isArray(json.transactions) ||
          !Array.isArray(json.goals)
        ) {
          throw new Error("Invalid schema structure. Must contain transactions and goals arrays.");
        }

        onImportBackup({
          transactions: json.transactions,
          goals: json.goals,
          monthlyLimit: Number(json.monthlyLimit) || 0,
          currencySymbol: json.currencySymbol || "$",
        });

        setSuccessMsg(`Successfully restored data! Loaded ${json.transactions.length} records and ${json.goals.length} target goals.`);
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err: any) {
        setErrorMsg(err?.message || "Parsing error: Decryption or structure mismatch. Please select a valid schema .json file.");
        setSuccessMsg(null);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
        <span>Device Sync & Ledger Backups</span>
      </h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Export or import ledger entries locally</p>

      {successMsg && (
        <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-650 dark:text-rose-400 text-xs rounded-xl">
          <span className="font-bold">Restore failed:</span> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export Card */}
        <button
          onClick={handleExportBackup}
          className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left transition-all flex items-start gap-3 group"
        >
          <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Download JSON Backup</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block leading-relaxed">
              Export all {transactions.length} records, categories, and {goals.length} target goals to a single offline-friendly file.
            </span>
          </div>
        </button>

        {/* Import Card */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all flex items-start gap-3 group"
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Restore Data / Import</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block leading-relaxed">
                Choose a previous JSON backup ledger file from your downloads folder to restore all savings configuration instantly.
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
