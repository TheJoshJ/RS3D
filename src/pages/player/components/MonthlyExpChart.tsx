import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getExperienceHistory } from "@/hooks/getExperienceHistory";

interface MonthlyExpChartProps {
  username: string;
  skillId: number;
}

export const MonthlyExpChart = ({
  username,
  skillId,
}: MonthlyExpChartProps) => {
  const { data: expHistoryData } = getExperienceHistory(username, skillId);

  // Extract data for the chart
  const chartData = React.useMemo(() => {
    const monthlyXpGain = expHistoryData?.monthlyXpGain.find(
      (skill) => skill.skillId === skillId
    );

    if (!monthlyXpGain) return [];

    return monthlyXpGain.monthData.map((month) => ({
      date: new Date(month.timestamp).toISOString().split("T")[0],
      xpGain: month.xpGain,
    }));
  }, [expHistoryData, skillId]);

  const totalXpGain = React.useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, curr) => acc + curr.xpGain, 0);
  }, [chartData]);

  const emptyChartData = Array.from({ length: 12 }).map((_, index) => ({
    date: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    xpGain: 0,
  }));

  const chartDataToUse = chartData.length ? chartData : emptyChartData;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Monthly Exp Gain</CardTitle>
          <CardDescription>
            {!chartData.length
              ? "Loading..."
              : "View experience gain over the last 12 months."}
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active={true}
            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-t-0 sm:px-8 sm:py-6"
          >
            <span className="text-xs text-muted-foreground">
              Total Experience Gained
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {totalXpGain.toLocaleString()}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{
            xpGain: { label: "Experience Gain", color: "hsl(var(--chart-5))" },
          }}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartDataToUse}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  nameKey="xpGain"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey="xpGain" fill={`var(--color-xpGain)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
