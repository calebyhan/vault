'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ColumnMapperProps {
  headers: string[];
  onMapping: (mapping: { date: string; merchant: string; amount: string }) => void;
  onCancel: () => void;
}

export function ColumnMapper({ headers, onMapping, onCancel }: ColumnMapperProps) {
  const [dateCol, setDateCol] = useState<string>('');
  const [merchantCol, setMerchantCol] = useState<string>('');
  const [amountCol, setAmountCol] = useState<string>('');

  const handleSubmit = () => {
    if (!dateCol || !merchantCol || !amountCol) {
      alert('Please select all required columns');
      return;
    }

    onMapping({
      date: dateCol,
      merchant: merchantCol,
      amount: amountCol,
    });
  };

  const isValid = dateCol && merchantCol && amountCol;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map CSV Columns</CardTitle>
        <CardDescription>
          We couldn't auto-detect the columns. Please manually map them below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Column *</label>
            <select
              value={dateCol}
              onChange={(e) => setDateCol(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select column...</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Merchant/Description Column *</label>
            <select
              value={merchantCol}
              onChange={(e) => setMerchantCol(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select column...</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Column *</label>
            <select
              value={amountCol}
              onChange={(e) => setAmountCol(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select column...</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Continue to Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
