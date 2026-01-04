'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

interface PreviewTransaction {
  date: string;
  merchant: string;
  amount: number;
  raw_description: string;
  currency?: string; // Currency code
  status?: 'ok' | 'warning' | 'error';
  statusMessage?: string;
}

interface ImportPreviewProps {
  transactions: PreviewTransaction[];
  totalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportPreview({ transactions, totalCount, onConfirm, onCancel }: ImportPreviewProps) {
  const previewTransactions = transactions.slice(0, 10);
  const hasErrors = transactions.some(t => t.status === 'error');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Transactions</CardTitle>
        <CardDescription>
          Showing first {previewTransactions.length} of {totalCount} transactions. Review before importing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Merchant</th>
                <th className="p-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {previewTransactions.map((transaction, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    {transaction.status === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" title={transaction.statusMessage} />
                    ) : transaction.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-orange-500" title={transaction.statusMessage} />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </td>
                  <td className="p-3">{transaction.date}</td>
                  <td className="p-3">
                    <div className="font-medium">{transaction.merchant}</div>
                    {transaction.raw_description && transaction.raw_description !== transaction.merchant && (
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {transaction.raw_description}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {transaction.currency && transaction.currency !== 'USD' ? (
                      <span>
                        {transaction.amount.toFixed(2)} <span className="text-xs text-muted-foreground">{transaction.currency}</span>
                      </span>
                    ) : (
                      `$${transaction.amount.toFixed(2)}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalCount > 10 && (
          <p className="text-sm text-muted-foreground text-center">
            ... and {totalCount - 10} more transaction{totalCount - 10 !== 1 ? 's' : ''}
          </p>
        )}

        <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total transactions:</span>
            <span className="font-semibold">{totalCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Currencies detected:</span>
            <span className="font-semibold">
              {[...new Set(transactions.map(t => t.currency || 'USD'))].join(', ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Will be converted to:</span>
            <span className="font-semibold text-green-600">USD</span>
          </div>
          <div className="flex justify-between">
            <span>Categorization:</span>
            <span className="font-semibold text-green-600">With AI</span>
          </div>
          {hasErrors && (
            <div className="flex items-center gap-2 text-destructive pt-2 border-t">
              <AlertCircle className="h-4 w-4" />
              <span>Some transactions have errors and may be skipped</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Import {totalCount} Transaction{totalCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
