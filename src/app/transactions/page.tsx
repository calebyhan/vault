'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Search, Trash2, Edit, Filter } from 'lucide-react';
import type { Transaction } from '@/lib/types/transaction';
import { CATEGORIES } from '@/lib/constants/categories';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DatePicker } from '@/components/ui/date-picker';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ merchant: '', amount: '', category: '', date: '' });

  useEffect(() => {
    loadTransactions();
  }, [search]);

  const loadTransactions = async () => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const data = await window.electronAPI.getTransactions({ search });
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (id: number, category: string) => {
    try {
      await window.electronAPI.updateTransaction(id, { category });
      await loadTransactions();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (transactionToDelete === null) return;

    try {
      await window.electronAPI.deleteTransaction(transactionToDelete);
      await loadTransactions();
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await window.electronAPI.deleteAllTransactions();
      await loadTransactions();
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete all transactions:', error);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setEditForm({
      merchant: transaction.merchant,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!transactionToEdit) return;

    try {
      await window.electronAPI.updateTransaction(transactionToEdit.id, {
        merchant: editForm.merchant,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date,
      });
      await loadTransactions();
      setEditDialogOpen(false);
      setTransactionToEdit(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  // Filter transactions based on category, type, and date range
  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;

    // Date range filtering
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.date);

      if (dateFrom && dateTo) {
        // Both dates specified
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        matchesDateRange = transactionDate >= fromDate && transactionDate <= toDate;
      } else if (dateFrom) {
        // Only from date specified - filter from min to current
        const fromDate = new Date(dateFrom);
        matchesDateRange = transactionDate >= fromDate;
      } else if (dateTo) {
        // Only to date specified - filter from first to max
        const toDate = new Date(dateTo);
        matchesDateRange = transactionDate <= toDate;
      }
    }

    return matchesCategory && matchesType && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Transactions</h1>
            <p className="text-muted-foreground mt-2">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {transactions.length > 0 && (
              <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {transactions.length} transactions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
            {showFilters && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transaction Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="all">All Types</option>
                      <option value="purchase">Purchase</option>
                      <option value="transfer">Transfer</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <DatePicker
                      value={dateFrom}
                      onChange={setDateFrom}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for all dates from the beginning
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <DatePicker
                      value={dateTo}
                      onChange={setDateTo}
                      placeholder="YYYY-MM-DD"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for all dates up to now
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        {transactions.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No transactions found</p>
              <Link href="/import">
                <Button className="mt-4">Import Transactions</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-left font-medium">Merchant</th>
                      <th className="p-3 text-left font-medium">Type</th>
                      <th className="p-3 text-right font-medium">Amount</th>
                      <th className="p-3 text-left font-medium">Category</th>
                      <th className="p-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{transaction.date}</td>
                        <td className="p-3">
                          <div className="font-medium">{transaction.merchant}</div>
                          {transaction.raw_description && (
                            <div className="text-xs text-muted-foreground truncate max-w-md">
                              {transaction.raw_description}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.transaction_type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : transaction.transaction_type === 'transfer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {transaction.transaction_type || 'purchase'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <select
                            value={transaction.category}
                            onChange={(e) => handleCategoryChange(transaction.id, e.target.value)}
                            className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(transaction)}
                              className="hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog open={deleteDialogOpen && transactionToDelete === transaction.id} onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setTransactionToDelete(null);
                            }}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setTransactionToDelete(transaction.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this transaction? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Transaction Dialog */}
        <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Update the transaction details below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Merchant</label>
                <input
                  type="text"
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <DatePicker
                  value={editForm.date}
                  onChange={(value) => setEditForm({ ...editForm, date: value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEditSave}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
