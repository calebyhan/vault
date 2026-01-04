'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Search, Trash2, Edit, Filter, Settings, GitCompare, AlertCircle, Download } from 'lucide-react';
import type { Transaction, CurrencyCode } from '@/lib/types/transaction';
import { CATEGORIES, CATEGORY_COLORS, TYPE_COLORS } from '@/lib/constants/categories';
import { isProblematicDate } from '@/lib/utils/date-utils';
import { formatTransactionAmount, getSupportedCurrencies } from '@/lib/utils/currency-formatter';
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
import { UnifiedSettingsDialog } from '@/components/features/unified-settings-dialog';
import { FindSimilarDialog } from '@/components/features/transactions/find-similar-dialog';

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
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    merchant: '',
    amount: '',
    category: '',
    date: '',
    currency: 'USD' as CurrencyCode,
    originalAmount: ''
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [findSimilarOpen, setFindSimilarOpen] = useState(false);
  const [findSimilarTransaction, setFindSimilarTransaction] = useState<Transaction | null>(null);
  const [problematicDatesOpen, setProblematicDatesOpen] = useState(false);
  const [problematicTransactions, setProblematicTransactions] = useState<Transaction[]>([]);

  // Pagination state - enabled by default with 50 items
  const [paginationEnabled, setPaginationEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const tableTopRef = useRef<HTMLDivElement>(null);

  // Handle page change with scroll to top
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    loadTransactions();
  }, [search]);

  // Detect problematic dates whenever transactions change
  useEffect(() => {
    const problematic = transactions.filter(t => isProblematicDate(t.date));
    setProblematicTransactions(problematic);
  }, [transactions]);

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

  const handleTypeChange = async (id: number, transaction_type: string) => {
    try {
      await window.electronAPI.updateTransaction(id, { transaction_type });
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
    } catch (error) {
      console.error('Failed to delete all transactions:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const filters = {
        search,
        category: categoryFilter,
        transactionType: typeFilter,
        dateFrom,
        dateTo,
      };
      const filePath = await (window as any).electronAPI.exportTransactionsCSV(filters);
      if (filePath) {
        alert(`Export successful! File saved to:\n${filePath}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error}`);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setEditForm({
      merchant: transaction.merchant,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
      currency: transaction.original_currency || 'USD',
      originalAmount: (transaction.original_amount || transaction.amount).toString(),
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!transactionToEdit) return;

    try {
      await window.electronAPI.updateTransaction(transactionToEdit.id, {
        merchant: editForm.merchant,
        original_amount: parseFloat(editForm.originalAmount),
        original_currency: editForm.currency,
        category: editForm.category,
        date: editForm.date,
      });
      await loadTransactions();
      setEditDialogOpen(false);
      setTransactionToEdit(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert('Failed to update transaction. Check console for details.');
    }
  };

  const handleFindSimilar = (transaction: Transaction) => {
    setFindSimilarTransaction(transaction);
    setFindSimilarOpen(true);
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

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = paginationEnabled
    ? filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredTransactions;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, typeFilter, dateFrom, dateTo, search]);

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
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
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
            <CardHeader ref={tableTopRef}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle>All Transactions</CardTitle>
                </div>
                {/* Problematic Dates Warning Button */}
                {problematicTransactions.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setProblematicDatesOpen(true)}
                    className="mr-2"
                    title={`${problematicTransactions.length} transaction${problematicTransactions.length !== 1 ? 's' : ''} with date issues`}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {problematicTransactions.length}
                  </Button>
                )}
                {/* Top Pagination Navigation */}
                {filteredTransactions.length > 0 && paginationEnabled && totalPages > 1 && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      &lt;&lt;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </Button>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      &gt;&gt;
                    </Button>
                  </div>
                )}
              </div>
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
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{transaction.date}</td>
                        <td className="p-3 max-w-[300px]">
                          <div className="font-medium truncate">{transaction.merchant}</div>
                          {transaction.raw_description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {transaction.raw_description}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={transaction.transaction_type || 'purchase'}
                            onChange={(e) => handleTypeChange(transaction.id, e.target.value)}
                            className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                            style={{ color: TYPE_COLORS[transaction.transaction_type || 'purchase'] }}
                          >
                            <option value="purchase" style={{ color: TYPE_COLORS.purchase }}>Purchase</option>
                            <option value="transfer" style={{ color: TYPE_COLORS.transfer }}>Transfer</option>
                            <option value="income" style={{ color: TYPE_COLORS.income }}>Income</option>
                          </select>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatTransactionAmount(
                            transaction.usd_amount || transaction.amount,
                            transaction.original_amount || transaction.amount,
                            transaction.original_currency || 'USD',
                            transaction.original_currency !== 'USD'
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={transaction.category}
                            onChange={(e) => handleCategoryChange(transaction.id, e.target.value)}
                            className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                            style={{ color: CATEGORY_COLORS[transaction.category] }}
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} style={{ color: CATEGORY_COLORS[cat] }}>
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
                              onClick={() => handleFindSimilar(transaction)}
                              className="hover:text-primary"
                              title="Find similar transactions"
                            >
                              <GitCompare className="h-4 w-4" />
                            </Button>
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
                              <AlertDialogContent
                                onEscapeKeyDown={() => {
                                  setDeleteDialogOpen(false);
                                  setTransactionToDelete(null);
                                }}
                                onPointerDownOutside={() => {
                                  setDeleteDialogOpen(false);
                                  setTransactionToDelete(null);
                                }}
                              >
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

              {/* Pagination Navigation */}
              {filteredTransactions.length > 0 && paginationEnabled && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Problematic Dates Warning Button */}
                    {problematicTransactions.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProblematicDatesOpen(true)}
                        className="mr-2"
                        title={`${problematicTransactions.length} transaction${problematicTransactions.length !== 1 ? 's' : ''} with date issues`}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {problematicTransactions.length}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      &lt;&lt;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      &gt;&gt;
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Transaction Dialog */}
        <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <AlertDialogContent
            onEscapeKeyDown={() => setEditDialogOpen(false)}
            onPointerDownOutside={() => setEditDialogOpen(false)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Update the transaction details below. Currency changes will trigger automatic USD conversion.
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

              {/* Currency Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value as CurrencyCode })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {getSupportedCurrencies().map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ({editForm.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.originalAmount}
                  onChange={(e) => setEditForm({ ...editForm, originalAmount: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Original amount in {editForm.currency}. Will be converted to USD automatically.
                </p>
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
            <AlertDialogFooter className="flex justify-between items-center">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (transactionToEdit) {
                    await window.electronAPI.deleteTransaction(transactionToEdit.id);
                    await loadTransactions();
                    setEditDialogOpen(false);
                    setTransactionToEdit(null);
                  }
                }}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEditSave}>
                  Save Changes
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Settings Dialog */}
        <UnifiedSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          paginationEnabled={paginationEnabled}
          setPaginationEnabled={(enabled) => {
            setPaginationEnabled(enabled);
            setCurrentPage(1);
          }}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
          transactionCount={transactions.length}
          onDeleteAll={handleDeleteAll}
        />

        {/* Find Similar Dialog */}
        <FindSimilarDialog
          transaction={findSimilarTransaction}
          isOpen={findSimilarOpen}
          onClose={() => setFindSimilarOpen(false)}
          onUpdate={loadTransactions}
        />

        {/* Problematic Dates Dialog */}
        <AlertDialog open={problematicDatesOpen} onOpenChange={setProblematicDatesOpen}>
          <AlertDialogContent 
            className="max-w-4xl max-h-[80vh] overflow-y-auto"
            onEscapeKeyDown={() => setProblematicDatesOpen(false)}
            onPointerDownOutside={() => setProblematicDatesOpen(false)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Transactions with Date Issues
              </AlertDialogTitle>
              <AlertDialogDescription>
                The following transactions have incomplete or malformed dates. Click on any transaction to edit it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 my-4">
              {problematicTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No problematic dates found!</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium w-[120px]">Date</th>
                        <th className="p-2 text-left font-medium">Merchant</th>
                        <th className="p-2 text-right font-medium">Amount</th>
                        <th className="p-2 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problematicTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-2 w-[120px]">
                            <span className="text-destructive font-medium">{transaction.date || '(empty)'}</span>
                          </td>
                          <td className="p-2 max-w-[300px] truncate">{transaction.merchant}</td>
                          <td className="p-2 text-right">
                            {formatTransactionAmount(
                              transaction.usd_amount || transaction.amount,
                              transaction.original_amount || transaction.amount,
                              transaction.original_currency || 'USD',
                              transaction.original_currency !== 'USD'
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setProblematicDatesOpen(false);
                                  handleEditClick(transaction);
                                }}
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
                                <AlertDialogContent
                                  onEscapeKeyDown={() => {
                                    setDeleteDialogOpen(false);
                                    setTransactionToDelete(null);
                                  }}
                                  onPointerDownOutside={() => {
                                    setDeleteDialogOpen(false);
                                    setTransactionToDelete(null);
                                  }}
                                >
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
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
