'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types/transaction';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants/categories';
import { Loader2 } from 'lucide-react';

interface SimilarTransaction {
  transaction: Transaction;
  similarity: {
    score: number;
    method: string;
  };
  extraction: {
    coreName: string;
    storeId?: string;
    location?: string;
  };
}

interface SimilarVendorGroup {
  coreName: string;
  transactions: SimilarTransaction[];
  averageSimilarity: number;
}

interface FindSimilarDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function FindSimilarDialog({
  transaction,
  isOpen,
  onClose,
  onUpdate,
}: FindSimilarDialogProps) {
  const [loading, setLoading] = useState(false);
  const [similar, setSimilar] = useState<SimilarTransaction[]>([]);
  const [grouped, setGrouped] = useState<SimilarVendorGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [threshold, setThreshold] = useState(0.70);

  useEffect(() => {
    if (isOpen && transaction) {
      loadSimilarTransactions();
      setCategory(transaction.category);
      setTransactionType(transaction.transaction_type || 'purchase');
    }
  }, [isOpen, transaction, threshold]);

  const loadSimilarTransactions = async () => {
    if (!transaction) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.findSimilarTransactions(
        transaction.id,
        threshold
      );

      setSimilar(result.similar);
      setGrouped(result.grouped);

      // Pre-select all high-confidence matches (>= 0.85)
      const highConfidence = result.similar
        .filter((s: SimilarTransaction) => s.similarity.score >= 0.85)
        .map((s: SimilarTransaction) => s.transaction.id);

      setSelected(new Set(highConfidence));
    } catch (error) {
      console.error('Failed to find similar transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    setSelected(new Set(similar.map(s => s.transaction.id)));
  };

  const handleDeselectAll = () => {
    setSelected(new Set());
  };

  const handleApply = async () => {
    if (selected.size === 0 && !transaction) return;

    // Include the original transaction ID plus all selected similar transactions
    const transactionIds = Array.from(selected);
    if (transaction && !transactionIds.includes(transaction.id)) {
      transactionIds.push(transaction.id);
    }

    const updates = {
      category,
      transaction_type: transactionType,
    };

    console.log('Applying batch update:', { transactionIds, updates });

    try {
      const count = await window.electronAPI.batchUpdateTransactions(
        transactionIds,
        updates
      );

      console.log(`Updated ${count} transactions`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update transactions:', error);
      alert(`Failed to update transactions: ${error}`);
    }
  };

  if (!transaction) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        onEscapeKeyDown={() => onClose()}
        onPointerDownOutside={() => onClose()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Find Similar Transactions</AlertDialogTitle>
          <AlertDialogDescription>
            Select transactions with similar merchants to update in bulk
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Original Transaction */}
        <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Original Transaction:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Merchant:</span> {transaction.merchant}
            </div>
            <div>
              <span className="font-medium">Date:</span> {transaction.date}
            </div>
            <div>
              <span className="font-medium">Amount:</span> ${transaction.amount.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Category:</span> {transaction.category}
            </div>
          </div>
          {transaction.raw_description && (
            <div className="mt-2 text-xs text-muted-foreground">
              Raw: {transaction.raw_description}
            </div>
          )}
        </div>

        {/* Threshold Slider */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            Similarity Threshold: {threshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Loose (0.50)</span>
            <span>Strict (0.95)</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Finding similar transactions...</span>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            {similar.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No similar transactions found. Try lowering the threshold.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">
                    Found {similar.length} similar transaction{similar.length !== 1 ? 's' : ''}:
                  </h3>

                  <div className="flex gap-2 mb-3">
                    <Button size="sm" variant="outline" onClick={handleSelectAll}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                      Deselect All
                    </Button>
                  </div>

                  <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                    {similar.map((item) => (
                      <label
                        key={item.transaction.id}
                        className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(item.transaction.id)}
                          onChange={() => handleToggle(item.transaction.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {item.transaction.merchant}
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                item.similarity.score >= 0.9
                                  ? 'bg-green-100 text-green-800'
                                  : item.similarity.score >= 0.8
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {(item.similarity.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.transaction.date} • ${item.transaction.amount.toFixed(2)} •{' '}
                            {item.transaction.category}
                          </div>
                          {(item.extraction.storeId || item.extraction.location) && (
                            <div className="text-xs text-muted-foreground">
                              {item.extraction.storeId && `Store: ${item.extraction.storeId}`}
                              {item.extraction.storeId && item.extraction.location && ' • '}
                              {item.extraction.location}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply Settings */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    Apply to selected ({selected.size + 1} transaction{selected.size + 1 !== 1 ? 's' : ''}):
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="purchase">Purchase</option>
                        <option value="transfer">Transfer</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleApply}
            disabled={selected.size === 0 || loading}
          >
            Apply to {selected.size + 1} Transaction{selected.size + 1 !== 1 ? 's' : ''}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
