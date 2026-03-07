'use client';

import { mockAlerts } from '@/lib/mock-data';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { FaXTwitter } from 'react-icons/fa6';
import type { ComponentType } from 'react';

export default function MentionsPage() {

  const platformIcons: Record<string, ComponentType<any>> = {
    X: FaXTwitter,
  };

  const sentimentStyles: Record<string, string> = {
    positive: 'bg-green-500/10 text-green-400 border-green-500/30',
    neutral: 'bg-muted/50 text-muted-foreground border-border',
    negative: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const Icon = platformIcons[platform];
    return Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null;
  };

  // Alert statistics
  const totalAlerts = mockAlerts.length;

  const criticalAlerts = mockAlerts.filter(
    (a) => a.riskLevel === 'Critical'
  ).length;

  const highAlerts = mockAlerts.filter(
    (a) => a.riskLevel === 'High'
  ).length;

  const mediumAlerts = mockAlerts.filter(
    (a) => a.riskLevel === 'Medium'
  ).length;

  const lowAlerts = mockAlerts.filter(
    (a) => a.riskLevel === 'Low'
  ).length;

  return (
    <div className="min-h-screen bg-background px-6 py-8">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mentions & Alerts
          </h1>

          <p className="text-sm text-muted-foreground">
            Review social media mentions, phishing attempts, and brand
            impersonation alerts.
          </p>
        </div>

        {/* Mentions Table */}
        <Card className="overflow-hidden border border-border">

          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-sm font-semibold">
              Recent Mentions
              <span className="ml-2 text-xs text-muted-foreground">
                {totalAlerts} total
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>
                <TableRow className="border-b border-border">

                  <TableHead className="text-muted-foreground">
                    Platform
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Author
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Content
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Sentiment
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Keyword
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Date
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {mockAlerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="border-b border-border hover:bg-muted/40 transition-colors"
                  >

                    {/* Platform */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={alert.platform} />

                        <span className="text-sm font-medium uppercase">
                          {alert.platform}
                        </span>
                      </div>
                    </TableCell>

                    {/* Author */}
                    <TableCell className="text-sm text-muted-foreground">
                      {alert.author}
                    </TableCell>

                    {/* Content */}
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {alert.content}
                    </TableCell>

                    {/* Sentiment */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={sentimentStyles[alert.sentiment]}
                      >
                        {alert.sentiment}
                      </Badge>
                    </TableCell>

                    {/* Keyword */}
                    <TableCell className="text-sm font-medium">
                      {alert.keyword}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {alert.createdAt}
                    </TableCell>

                  </TableRow>
                ))}

              </TableBody>

            </Table>

          </div>

        </Card>

        {/* Alert Insights */}
        <Card className="p-6 border border-border">

          <h2 className="mb-6 text-xl font-semibold">
            Alert Insights
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Total Alerts
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {totalAlerts}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Critical
              </p>

              <p className="mt-1 text-2xl font-semibold text-red-400">
                {criticalAlerts}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                High
              </p>

              <p className="mt-1 text-2xl font-semibold text-orange-400">
                {highAlerts}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Medium
              </p>

              <p className="mt-1 text-2xl font-semibold text-yellow-400">
                {mediumAlerts}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Low
              </p>

              <p className="mt-1 text-2xl font-semibold text-green-400">
                {lowAlerts}
              </p>
            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}