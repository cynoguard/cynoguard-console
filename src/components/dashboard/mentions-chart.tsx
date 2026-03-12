'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import type { DashboardData } from '@/lib/types/social-alert';

const defaultChartData = [
  { date: 'Feb 18', mentions: 32 },
  { date: 'Feb 19', mentions: 45 },
  { date: 'Feb 20', mentions: 38 },
  { date: 'Feb 21', mentions: 52 },
  { date: 'Feb 22', mentions: 68 },
  { date: 'Feb 23', mentions: 75 },
  { date: 'Feb 24', mentions: 92 },
  { date: 'Feb 25', mentions: 88 },
  { date: 'Feb 26', mentions: 65 },
  { date: 'Feb 27', mentions: 42 },
  { date: 'Feb 28', mentions: 55 },
];

interface MentionsChartProps {
  data?: DashboardData | null;
  loading?: boolean;
}

export function MentionsChart({ loading }: MentionsChartProps) {

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-72 w-full rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-6">

      <h3 className="mb-6 text-lg font-semibold">
        Mentions Over Time
      </h3>

      <div className="h-64 w-full">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={defaultChartData}>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />

            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
            />

            <YAxis
              stroke="#888888"
              fontSize={12}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />

            <Line
              type="monotone"
              dataKey="mentions"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </Card>
  );
}