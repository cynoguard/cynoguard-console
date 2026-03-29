'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardData } from '@/lib/types/social-alert';

interface MentionsChartProps {
  data?:      DashboardData | null;
  loading?:   boolean;
  chartData?: { date: string; mentions: number }[];
}

export function MentionsChart({ loading, chartData }: MentionsChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-72 w-full rounded" />
      </Card>
    );
  }

  const hasData = chartData && chartData.some(d => d.mentions > 0);

  return (
    <Card className="p-6">
      <h3 className="mb-1 text-lg font-semibold">Mentions Over Time</h3>
      <p className="mb-5 text-xs text-muted-foreground">30-day rolling window</p>

      <div className="h-64 w-full">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No mention data yet — add keywords and run a scan.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
              <XAxis dataKey="date" stroke="#888888" fontSize={11} tick={{ fill: '#888' }} />
              <YAxis stroke="#888888" fontSize={11} tick={{ fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(v: number) => [v, 'Mentions']}
              />
              <Line
                type="monotone"
                dataKey="mentions"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}