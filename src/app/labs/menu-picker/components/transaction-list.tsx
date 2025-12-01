interface Transaction {
  recipient: string;
  amount: number;
  timestamp: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
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
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="max-h-[600px] overflow-y-auto">
        <div className="divide-y divide-neutral-100">
          {transactions.map((transaction, index) => (
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
  );
}
