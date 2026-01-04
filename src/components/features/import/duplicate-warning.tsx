'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DuplicateWarningProps {
  duplicates: Array<{
    newTransaction: { date: string; merchant: string; amount: number };
    existingMatches: any[];
    matchCount: number;
  }>;
  onRemoveDuplicates: (indices: number[]) => void;
}

export function DuplicateWarning({ duplicates, onRemoveDuplicates }: DuplicateWarningProps) {
  const [expanded, setExpanded] = useState(false);

  if (duplicates.length === 0) {
    return null;
  }

  const handleRemoveAll = () => {
    // Get indices of all duplicate transactions
    const indicesToRemove = duplicates.map((dup, idx) => idx);
    onRemoveDuplicates(indicesToRemove);
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Potential Duplicates Detected
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Found {duplicates.length} transaction{duplicates.length !== 1 ? 's' : ''} that may
                already exist in the database
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAll}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <X className="mr-2 h-4 w-4" />
            Remove All Duplicates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-orange-700 hover:text-orange-900"
          >
            {expanded ? 'Hide' : 'Show'} Details
          </Button>

          {expanded && (
            <div className="space-y-3 mt-3">
              {duplicates.map((dup, idx) => (
                <div
                  key={idx}
                  className="border border-orange-200 rounded-lg p-3 bg-white dark:bg-gray-900"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      New Transaction
                    </div>
                    <div className="text-xs text-orange-600">
                      {dup.matchCount} existing match{dup.matchCount !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="font-medium">{dup.newTransaction.date}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Merchant</div>
                      <div className="font-medium">{dup.newTransaction.merchant}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-medium">${dup.newTransaction.amount.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="border-t border-orange-100 pt-2 mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Existing in database:
                    </div>
                    {dup.existingMatches.slice(0, 2).map((match, mIdx) => (
                      <div key={mIdx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {match.date} - {match.merchant} - ${match.amount.toFixed(2)} (
                        {match.category})
                      </div>
                    ))}
                    {dup.existingMatches.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ... and {dup.existingMatches.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
