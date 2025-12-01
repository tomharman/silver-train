"use client";

import { useState } from "react";

interface Transaction {
  recipient: string;
  amount: number;
  timestamp: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (selectedTransaction === transaction) {
      setSelectedTransaction(null);
    } else {
      setSelectedTransaction(transaction);
    }
  };

  return (
    <div className="flex gap-6">
      <div className={`transition-all duration-300 ${selectedTransaction ? "flex-[2]" : "flex-1"}`}>
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-border">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  onClick={() => handleTransactionClick(transaction)}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${
                    selectedTransaction === transaction
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xs font-medium text-muted-foreground w-12 flex-shrink-0">
                    {formatDate(transaction.timestamp)}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-grow">
                    {transaction.recipient}
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                      transaction.amount >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <div className="flex-1 transition-all duration-300">
          <div className="rounded-lg border bg-card shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-foreground">Transaction Details</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Recipient</div>
                <div className="text-2xl font-semibold text-foreground">
                  {selectedTransaction.recipient}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Amount</div>
                <div
                  className={`text-4xl font-bold tabular-nums ${
                    selectedTransaction.amount >= 0
                      ? "text-green-600 dark:text-green-500"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {formatAmount(selectedTransaction.amount)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                <div className="text-lg text-foreground">
                  {formatFullDate(selectedTransaction.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
