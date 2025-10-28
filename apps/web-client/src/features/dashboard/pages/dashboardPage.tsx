import { CardStats } from "../components/cardStats";
import { ChartBarInteractive } from "../components/graph";
import { TableTransactions } from "../components/tableTransactions";
import { HeaderDashboard } from "../components/headerDashboard";

export const DashboardPage = () => {
  return (
    <div className="w-full h-full flex  justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <HeaderDashboard />
          {/* Stats Grid */}
          <div className="flex flex-col gap-2">
            <h3 className="flex flex-row justify-end text-sm font-bold text-muted-foreground capitalize">
              Mes Octubre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardStats type="total" value={2000000} currency="COP" />
              <CardStats type="income" value={2000000} currency="COP" />
              <CardStats type="expense" value={1000000} currency="COP" />
            </div>
          </div>
          {/* Chart */}
          <ChartBarInteractive />
          {/* Table */}
          <TableTransactions />
        </div>
      </div>
    </div>
  );
};
