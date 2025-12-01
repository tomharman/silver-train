interface Transaction {
  recipient: string;
  amount: number;
  timestamp: string;
}

export function TransactionChart({ transactions }: { transactions: Transaction[] }) {
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
            className={bar.isPositive ? "fill-green-600 dark:fill-green-500" : "fill-neutral-700 dark:fill-neutral-300"}
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
