"use client";

import { useState } from "react";
import transactionsData from "./data.json";
import { TransactionChart } from "./components/transaction-chart";
import { TransactionList } from "./components/transaction-list";
import { FilterButtons } from "./components/filter-buttons";

interface Transaction {
  recipient: string;
  amount: number;
  timestamp: string;
}

type FilterType = "all" | "inbound" | "outbound";

export default function MenuPickerPage() {
  const transactions: Transaction[] = transactionsData;
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "inbound") return transaction.amount > 0;
    if (filter === "outbound") return transaction.amount < 0;
    return true;
  });

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">
              Menu Picker
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>

          <FilterButtons filter={filter} onFilterChange={setFilter} />

          <div className="mb-6 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold mb-1">
                Transaction Timeline
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing transaction trends over time
              </p>
            </div>
            <div className="px-6 pb-6">
              <TransactionChart transactions={filteredTransactions} />
            </div>
          </div>

          <TransactionList transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
}
