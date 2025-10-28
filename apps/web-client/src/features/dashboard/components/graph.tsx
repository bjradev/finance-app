"use client";

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

export const description = "A stacked bar chart with a legend";

const chartData = [
  { month: "January", income: 2000000, expense: 1000000 },
  { month: "February", income: 3000000, expense: 2000000 },
  { month: "March", income: 2300000, expense: 1200000 },
  { month: "April", income: 700000, expense: 1900000 },
  { month: "May", income: 2000000, expense: 1300000 },
  { month: "June", income: 2100000, expense: 1400000 },
  { month: "February", income: 3000000, expense: 2000000 },
  { month: "March", income: 2300000, expense: 1200000 },
  { month: "April", income: 700000, expense: 1900000 },
  { month: "May", income: 2000000, expense: 1300000 },
  { month: "June", income: 2100000, expense: 1400000 },
  { month: "February", income: 3000000, expense: 2000000 },
  { month: "March", income: 2300000, expense: 1200000 },
  { month: "April", income: 700000, expense: 1900000 },
  { month: "May", income: 2000000, expense: 1300000 },
  { month: "June", income: 2100000, expense: 1400000 },
];

const chartConfig = {
  income: {
    label: "income",
    color: "#C9EDE1",
  },
  expense: {
    label: "expense",
    color: "#FECCCB",
  },
} satisfies ChartConfig;

export function ChartBarInteractive() {
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
              dataKey="month"
              tickLine={false}
              tickMargin={0.2}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
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
