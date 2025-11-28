export default function Home() {
  const transactions = [
    { name: "Coffee Shop", amount: "-$4.50" },
    { name: "Monthly Subscription", amount: "-$12.99" },
    { name: "Grocery Store", amount: "-$67.23" },
    { name: "Salary Deposit", amount: "+$2,500.00" },
    { name: "Restaurant", amount: "-$45.80" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 font-sans">
      <main className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Recent Transactions
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Your latest payments</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="divide-y divide-neutral-100">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="text-sm font-medium text-neutral-900">
                  {transaction.name}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    transaction.amount.startsWith("+")
                      ? "text-green-600"
                      : "text-neutral-700"
                  }`}
                >
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
