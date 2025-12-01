"use client";

import { useState } from "react";
import transactionsData from "@/data/transactions.json";

interface Transaction {
  recipient: string;
  amount: number;
  timestamp: string;
}

type FilterType = "all" | "inbound" | "outbound";

function TransactionChart({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-neutral-400">
        No transactions to display
      </div>
    );
  }

  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Sort transactions by timestamp
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate scales using all transactions
  const amounts = sortedTransactions.map((t) => t.amount);
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);
  const amountRange = maxAmount - minAmount;

  // Add padding to y-axis range
  const yMax = maxAmount + amountRange * 0.1;
  const yMin = minAmount - amountRange * 0.1;
  const yRange = yMax - yMin;

  // Calculate zero line position
  const zeroY = padding.top + chartHeight - ((0 - yMin) / yRange) * chartHeight;

  // Calculate bar width and spacing
  const barSpacing = 2;
  const barWidth = Math.max(
    4,
    Math.min(20, (chartWidth - (sortedTransactions.length - 1) * barSpacing) / sortedTransactions.length)
  );

  // Generate bars
  const bars = sortedTransactions.map((transaction, index) => {
    const x = padding.left + (index * (chartWidth / sortedTransactions.length)) + (chartWidth / sortedTransactions.length - barWidth) / 2;
    const amount = transaction.amount;

    // For positive amounts, bar goes from zero line up
    // For negative amounts, bar goes from zero line down
    if (amount >= 0) {
      const barHeight = ((amount - 0) / yRange) * chartHeight;
      const y = zeroY - barHeight;
      return { x, y, width: barWidth, height: barHeight, amount, isPositive: true };
    } else {
      const barHeight = ((0 - amount) / yRange) * chartHeight;
      const y = zeroY;
      return { x, y, width: barWidth, height: barHeight, amount, isPositive: false };
    }
  });

  // Format currency for y-axis
  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString()}`;
  };

  // Generate y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return yMin + (yRange * i) / (yTicks - 1);
  });

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Y-axis grid lines */}
        {yTickValues.map((value) => {
          const y = padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="stroke-border"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {value >= 0 ? "+" : "-"}
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* Zero line (thicker) */}
        {yMin < 0 && yMax > 0 && (
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            className="stroke-border"
            strokeWidth="1.5"
            opacity="0.5"
          />
        )}

        {/* Bars */}
        {bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            className={bar.isPositive ? "fill-green-600" : "fill-neutral-700"}
            rx="2"
            opacity="0.9"
            style={{
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
          />
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className="stroke-border"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          className="stroke-border"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
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

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-neutral-100">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="text-xs font-medium text-neutral-500 w-12 flex-shrink-0">
                    {formatDate(transaction.timestamp)}
                  </span>
                  <span className="text-sm font-medium text-neutral-900 flex-grow">
                    {transaction.recipient}
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
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
