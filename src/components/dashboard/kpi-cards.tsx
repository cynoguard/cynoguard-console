'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  CalendarClock,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

import type { DashboardData } from '@/lib/types/social-alert';

interface KpiCardsProps {
  data: DashboardData | null;
  loading: boolean;
}

export function KpiCards({ data, loading }: KpiCardsProps) {

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={`kpi-sk-${i}`} className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const total = data.totalMentions ?? 0;
  const mentionsToday = data.mentionsToday ?? 0;

  const positive = data.sentiment?.positive ?? 0;
  const negative = data.sentiment?.negative ?? 0;
  const neutral = data.sentiment?.neutral ?? 0;

  const positivePct = total ? ((positive / total) * 100).toFixed(1) : '0';
  const negativePct = total ? ((negative / total) * 100).toFixed(1) : '0';
  const neutralPct = total ? ((neutral / total) * 100).toFixed(1) : '0';

  const cards = [
    {
      label: 'Total Mentions',
      value: total.toLocaleString(),
      sub: 'All time',
      icon: MessageSquare,
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Mentions Today',
      value: mentionsToday.toLocaleString(),
      sub: 'Last 24 hours',
      icon: CalendarClock,
      iconBg: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: 'Positive',
      value: positive.toLocaleString(),
      sub: `${positivePct}%`,
      icon: ThumbsUp,
      iconBg: 'bg-green-500/10 text-green-400',
    },
    {
      label: 'Negative',
      value: negative.toLocaleString(),
      sub: `${negativePct}%`,
      icon: ThumbsDown,
      iconBg: 'bg-red-500/10 text-red-400',
    },
    {
      label: 'Neutral',
      value: neutral.toLocaleString(),
      sub: `${neutralPct}%`,
      icon: Minus,
      iconBg: 'bg-gray-500/10 text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

      {cards.map((card) => (
        <Card
          key={card.label}
          className="flex items-center gap-4 p-5 border border-border hover:border-primary/40 transition-all"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}
          >
            <card.icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-2xl font-semibold">{card.value}</p>

            <p className="text-xs text-muted-foreground">
              {card.label}
              <span className="ml-1 opacity-60">{card.sub}</span>
            </p>
          </div>
        </Card>
      ))}

    </div>
  );
}