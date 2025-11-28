"use client";

import { useState } from "react";
import transactionsData from "@/data/transactions.json";

interface Transaction {
  recipient: string;
  amount: number;
}

type FilterType = "all" | "inbound" | "outbound";

export default function Home() {
  const transactions: Transaction[] = transactionsData;
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "inbound") return transaction.amount > 0;
    if (filter === "outbound") return transaction.amount < 0;
    return true;
  });

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 font-sans">
      <main className="w-full max-w-2xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Recent Transactions
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter("inbound")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              filter === "inbound"
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            Inbound
          </button>
          <button
            onClick={() => setFilter("outbound")}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              filter === "outbound"
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            Outbound
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-neutral-100">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="text-sm font-medium text-neutral-900">
                    {transaction.recipient}
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      transaction.amount >= 0
                        ? "text-green-600"
                        : "text-neutral-700"
                    }`}
                  >
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
