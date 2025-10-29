import { useState, useMemo } from "react";
import { calculateStats, type PeriodType } from "../logic/summary";
import type { Transaction } from "@/shared/types/transactions.types";

export function useStatsWithPeriod(transactions: Transaction[]) {
  const [period, setPeriod] = useState<PeriodType>("month");

  const stats = useMemo(
    () => calculateStats(transactions, period),
    [transactions, period]
  );

  return {
    stats,
    period,
    setPeriod,
  };
}
