'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, TrendingUp, ShoppingCart, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// More refined color palette matching the theme
const COLORS = [
  'hsl(221, 83%, 53%)',  // Blue - Primary
  'hsl(142, 76%, 36%)',  // Green - Success
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(346, 77%, 50%)',  // Red/Pink
  'hsl(24, 95%, 53%)',   // Orange
  'hsl(199, 89%, 48%)',  // Cyan
  'hsl(48, 96%, 53%)',   // Yellow
  'hsl(280, 67%, 60%)',  // Lavender
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const data = await window.electronAPI.getDashboardStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.transactionCount > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your spending patterns across categories
          </p>
        </div>

        {!hasData ? (
          <Card className="p-12">
            <div className="text-center">
              <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No transactions yet</h2>
              <p className="text-muted-foreground mb-6">
                Get started by importing your credit card transactions
              </p>
              <Link href="/import">
                <Button size="lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Import CSV
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalSpent.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.transactionCount} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.avgAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      // Get top category excluding "Other"
                      const categoriesExcludingOther = Object.entries(stats.categoryTotals || {})
                        .filter(([cat]) => cat !== 'Other')
                        .sort(([, a], [, b]) => (b as number) - (a as number));
                      const topCat = categoriesExcludingOther[0]?.[0] || stats.topCategory;
                      return topCat;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const categoriesExcludingOther = Object.entries(stats.categoryTotals || {})
                        .filter(([cat]) => cat !== 'Other')
                        .sort(([, a], [, b]) => (b as number) - (a as number));
                      const topCat = categoriesExcludingOther[0]?.[0] || stats.topCategory;
                      return stats.categoryPercentages[topCat]?.toFixed(1);
                    })()}% of spending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.transactionCount}</div>
                  <p className="text-xs text-muted-foreground">Total count</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Interactive breakdown of your spending across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.categoryTotals || {})
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent, x, y, cx }) => {
                        const percentage = (percent * 100).toFixed(1);
                        // Only show label if percentage is significant enough
                        if (percent < 0.05) return '';
                        return `${name}\n${percentage}%`;
                      }}
                      labelLine={{
                        stroke: 'hsl(var(--muted-foreground))',
                        strokeWidth: 1,
                      }}
                    >
                      {Object.keys(stats.categoryTotals || {}).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{
                        color: 'hsl(var(--foreground))',
                        fontWeight: 600,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: '20px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <Link href="/import">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Import More Transactions
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline">View All Transactions</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
