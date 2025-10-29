import { CardStats } from "../components/cardStats";
import { ChartBarInteractive } from "../components/graph";
import { TableTransactions } from "../components/tableTransactions";
import { HeaderDashboard } from "../components/headerDashboard";
import { CardStatsGridSkeleton } from "../components/CardStatsSkeleton";
import { ChartSkeleton } from "../components/ChartSkeleton";
import { TableTransactionsSkeleton } from "../components/TableTransactionsSkeleton";
import { useGetTransactions } from "../hooks/useTransactions";
import { useAuthStore } from "@/app/store/authStore";
import { useStatsWithPeriod } from "../hooks/useStatsWithPeriod";
import { useTransactionsRealtime } from "../hooks/useTransactionsRealtime";
import { useDisplayCurrency } from "../hooks/useDisplayCurrency";
import { calculateStats } from "../logic/summary";
import { useMemo } from "react";

export const DashboardPage = () => {
  const { data: transactions = [], isLoading } = useGetTransactions();
  const { defaultCurrency, user } = useAuthStore();
  const { period, setPeriod } = useStatsWithPeriod(transactions);
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency(
    defaultCurrency || "COP"
  );
  useTransactionsRealtime(user?.id || "");

  // Calcular estadísticas con la moneda de visualización
  const stats = useMemo(
    () => calculateStats(transactions, period, displayCurrency),
    [transactions, period, displayCurrency]
  );

  return (
    <div className="w-full h-full flex  justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <HeaderDashboard
            period={period}
            onPeriodChange={setPeriod}
            displayCurrency={displayCurrency}
            onCurrencyChange={setDisplayCurrency}
          />

          {/* Stats Grid */}
          <div className="flex flex-col gap-2">
            <h3 className="flex flex-row justify-end text-sm font-bold text-muted-foreground capitalize">
              {stats.periodLabel}
            </h3>
            {isLoading ? (
              <CardStatsGridSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardStats
                  type="total"
                  value={stats.total}
                  displayCurrency={displayCurrency}
                />
                <CardStats
                  type="income"
                  value={stats.income}
                  displayCurrency={displayCurrency}
                />
                <CardStats
                  type="expense"
                  value={stats.expense}
                  displayCurrency={displayCurrency}
                />
              </div>
            )}
          </div>

          {/* Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <ChartBarInteractive
              period={period}
              displayCurrency={displayCurrency}
            />
          )}

          {/* Table */}
          {isLoading ? (
            <TableTransactionsSkeleton />
          ) : (
            <TableTransactions
              period={period}
              displayCurrency={displayCurrency}
            />
          )}
        </div>
      </div>
    </div>
  );
};
