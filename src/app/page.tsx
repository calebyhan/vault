'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, TrendingUp, ShoppingCart, Upload, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CATEGORY_COLORS, type Category } from '@/lib/constants/categories';
import { formatUSD } from '@/lib/utils/currency-formatter';
import { UnifiedSettingsDialog } from '@/components/features/unified-settings-dialog';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chartMonthsFilter, setChartMonthsFilter] = useState<number>(12); // 12 months default
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [chartWidth, setChartWidth] = useState<number>(1200);

  useEffect(() => {
    loadStats();
  }, []);

  // Track viewport width to size ticks sensibly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateWidth = () => setChartWidth(window.innerWidth || 1200);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
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

  // Prepare chart data
  const chartData = (() => {
    if (!stats?.monthlyData) return [];

    // First, collect all unique categories
    const allCategories = new Set<string>();
    stats.monthlyData.forEach((row: any) => {
      allCategories.add(row.category);
    });

    const monthlyMap: Record<string, any> = {};
    stats.monthlyData.forEach((row: any) => {
      if (!monthlyMap[row.month]) {
        monthlyMap[row.month] = { month: row.month, total: 0 };
        // Initialize all categories to 0 for this month
        allCategories.forEach(cat => {
          monthlyMap[row.month][cat] = 0;
        });
      }
      monthlyMap[row.month].total += row.total;
      monthlyMap[row.month][row.category] += row.total;
    });

    const allData = Object.values(monthlyMap).sort((a: any, b: any) => a.month.localeCompare(b.month));
    return chartMonthsFilter === -1 ? allData : allData.slice(-chartMonthsFilter);
  })();

  // Determine active categories
  const activeCategories = (() => {
    if (!chartData.length) return [] as Category[];
    const categoriesInChart = new Set<string>();
    chartData.forEach((row: any) => {
        Object.keys(row).forEach(key => {
            if (key !== 'month' && key !== 'total' && row[key] > 0) {
                categoriesInChart.add(key);
            }
        });
    });
    return Object.keys(CATEGORY_COLORS).filter(cat => categoriesInChart.has(cat)) as Category[];
  })();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Analyze your spending patterns across categories
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/import">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Import More Transactions
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline">View All Transactions</Button>
            </Link>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
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
                  Import File(s)
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
                    {formatUSD(stats.totalSpent)}
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
                    {formatUSD(stats.avgAmount)}
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

            {/* Monthly Trend - Bar Chart */}
            {stats.monthlyData && stats.monthlyData.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Monthly Spending Trend</CardTitle>
                      <CardDescription>Track your spending patterns over time</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={showCategoryBreakdown ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
                      >
                        {showCategoryBreakdown ? 'By Category' : 'Total Only'}
                      </Button>
                      <div className="border-l mx-2"></div>
                      <Button
                        variant={chartMonthsFilter === 6 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartMonthsFilter(6)}
                      >
                        6M
                      </Button>
                      <Button
                        variant={chartMonthsFilter === 12 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartMonthsFilter(12)}
                      >
                        12M
                      </Button>
                      <Button
                        variant={chartMonthsFilter === 24 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartMonthsFilter(24)}
                      >
                        24M
                      </Button>
                      <Button
                        variant={chartMonthsFilter === 36 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartMonthsFilter(36)}
                      >
                        36M
                      </Button>
                      <Button
                        variant={chartMonthsFilter === -1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartMonthsFilter(-1)}
                      >
                        All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ width: '100%', height: showCategoryBreakdown ? 420 : 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: showCategoryBreakdown ? 15 : 5 }}
                      >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return `${month}/${year.slice(2)}`;
                        }}
                        minTickGap={30}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => formatUSD(value)}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        formatter={(value: number) => formatUSD(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        }}
                        labelStyle={{
                          color: 'hsl(var(--foreground))',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                        cursor={{ fill: 'hsl(var(--muted) / 0.6)' }}
                      />
                      {showCategoryBreakdown && (
                        <Legend 
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            fontSize: '13px'
                          }}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
                        />
                      )}
                      {showCategoryBreakdown
                        ? activeCategories.map((category) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              stackId="a"
                              fill={(CATEGORY_COLORS as Record<string, string>)[category]}
                              name={category}
                            />
                          ))
                        : <Bar dataKey="total" fill="hsl(221, 83%, 53%)" name="Total Spent" />
                      }
                    </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
                        .filter(([, value]) => (value as number) > 0)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => {
                        const percentage = (percent * 100).toFixed(1);
                        // Only show label if percentage is significant enough (1% threshold)
                        if (percent < 0.01) return null;
                        return `${name}\n${percentage}%`;
                      }}
                      labelLine={{
                        stroke: 'hsl(var(--muted-foreground))',
                        strokeWidth: 1,
                      }}
                    >
                      {Object.entries(stats.categoryTotals || {})
                        .filter(([, value]) => (value as number) > 0)
                        .map(([category]) => (
                          <Cell
                            key={`cell-${category}`}
                            fill={CATEGORY_COLORS[category as Category]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatUSD(value)}
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
          </div>
        )}
        
        <UnifiedSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          transactionCount={stats?.transactionCount || 0}
          onDeleteAll={async () => {
            if (typeof window !== 'undefined' && window.electronAPI) {
              await window.electronAPI.deleteAllTransactions();
              loadStats();
            }
          }}
        />
      </div>
    </div>
  );
}
