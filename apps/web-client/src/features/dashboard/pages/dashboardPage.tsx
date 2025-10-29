import { CardStats } from "../components/cardStats";
import { ChartBarInteractive } from "../components/graph";
import { TableTransactions } from "../components/tableTransactions";
import { HeaderDashboard } from "../components/headerDashboard";
import { useGetTransactions } from "../hooks/useTransactions";
import { useAuthStore } from "@/app/store/authStore";
import { useStatsWithPeriod } from "../hooks/useStatsWithPeriod";
import { useTransactionsRealtime } from "../hooks/useTransactionsRealtime";

export const DashboardPage = () => {
  const { data: transactions = [] } = useGetTransactions();
  const { defaultCurrency, user } = useAuthStore();
  const { stats, period, setPeriod } = useStatsWithPeriod(transactions);
  useTransactionsRealtime(user?.id || "");

  return (
    <div className="w-full h-full flex  justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <HeaderDashboard period={period} onPeriodChange={setPeriod} />
          {/* Stats Grid */}
          <div className="flex flex-col gap-2">
            <h3 className="flex flex-row justify-end text-sm font-bold text-muted-foreground capitalize">
              {stats.periodLabel}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardStats
                type="total"
                value={stats.total}
                currency={defaultCurrency || "COP"}
              />
              <CardStats
                type="income"
                value={stats.income}
                currency={defaultCurrency || "COP"}
              />
              <CardStats
                type="expense"
                value={stats.expense}
                currency={defaultCurrency || "COP"}
              />
            </div>
          </div>
          {/* Chart */}
          <ChartBarInteractive period={period} />
          {/* Table */}
          <TableTransactions period={period} />
        </div>
      </div>
    </div>
  );
};
