import transactionsData from "@/data/transactions.json";

interface Transaction {
  recipient: string;
  amount: number;
}

export default function Home() {
  const transactions: Transaction[] = transactionsData;

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
            Your latest {transactions.length} payments
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-neutral-100">
              {transactions.map((transaction, index) => (
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
