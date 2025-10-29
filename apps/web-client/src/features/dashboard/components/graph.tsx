"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent } from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useGetTransactions } from "../hooks/useTransactions";
import { generateChartData, type PeriodType } from "../logic/summary";

interface ChartBarInteractiveProps {
  period?: PeriodType;
}

export const description = "A stacked bar chart with a legend";

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "#10b981",
  },
  expense: {
    label: "Gastos",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function ChartBarInteractive({
  period = "month",
}: ChartBarInteractiveProps) {
  const { data: transactions = [], isLoading } = useGetTransactions();

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return generateChartData(transactions, period);
  }, [transactions, period]);

  if (isLoading) {
    return (
      <Card className="p-0 shadow-none border-none">
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Cargando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-0 shadow-none border-none">
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            No hay datos de transacciones para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0 shadow-none border-none">
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="p-0 shadow-none border-none w-full h-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={0.2}
              axisLine={false}
              tickFormatter={(value) =>
                typeof value === "string"
                  ? value.split(" ")[0].slice(0, 3)
                  : value
              }
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="income"
              stackId="a"
              fill="var(--color-income)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="expense"
              stackId="a"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
