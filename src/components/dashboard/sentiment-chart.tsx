'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import type { DashboardData } from '@/lib/types/social-alert';

const COLORS = {
  positive: '#22c55e',
  neutral: '#64748b',
  negative: '#ef4444',
};

interface SentimentChartProps {
  data: DashboardData | null;
  loading: boolean;
}

export function SentimentChart({ data, loading }: SentimentChartProps) {

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mx-auto h-56 w-56 rounded-full" />
      </Card>
    );
  }

  const positive = data?.sentiment?.positive ?? 0;
  const neutral = data?.sentiment?.neutral ?? 0;
  const negative = data?.sentiment?.negative ?? 0;

  const total = positive + neutral + negative;

  const chartData = [
    { name: 'Positive', value: positive },
    { name: 'Neutral', value: neutral },
    { name: 'Negative', value: negative },
  ];

  return (
    <Card className="p-6">

      <h3 className="mb-4 text-sm font-semibold">
        Sentiment Distribution
      </h3>

      <div className="relative mx-auto flex h-[220px] w-full max-w-[320px] items-center justify-center">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Tooltip
              formatter={(value: number) => {
                const pct = total ? ((value / total) * 100).toFixed(1) : '0';
                return `${value.toLocaleString()} mentions (${pct}%)`;
              }}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              stroke="#0a0a0a"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
                />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>

        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-400">
            {total.toLocaleString()}
          </span>

          <span className="text-xs text-muted-foreground">
            total
          </span>
        </div>

      </div>

    </Card>
  );
}