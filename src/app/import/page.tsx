'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import Link from 'next/link';

export default function ImportPage() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleFileSelect = async () => {
    if (typeof window === 'undefined') {
      console.error('Window is undefined');
      return;
    }

    if (!window.electronAPI) {
      console.error('electronAPI not found - are you running in Electron?');
      alert('This feature requires Electron. Please run: npm run dev');
      return;
    }

    console.log('Opening file dialog...');
    try {
      const selectedPath = await window.electronAPI.selectCsvFile();
      console.log('File dialog result:', selectedPath);

      if (selectedPath) {
        setFilePath(selectedPath);
        console.log('Selected file:', selectedPath);
        // Automatically start importing
        await handleRealFileImport(selectedPath);
      } else {
        console.log('No file selected (user cancelled)');
      }
    } catch (error) {
      console.error('Error in file selection:', error);
      alert(`Error: ${error}`);
    }
  };

  const handleRealFileImport = async (path: string) => {
    setImporting(true);
    setProgress(10);

    try {
      // Parse the file
      const parseResult = await window.electronAPI.parseFile(path);
      setProgress(30);

      console.log('Parsed file:', parseResult);

      // For now, if we got headers but no transactions, show a message
      if (parseResult.headers && parseResult.transactions.length === 0) {
        alert(`File parsed! Found columns: ${parseResult.headers.join(', ')}\n\nColumn mapping UI coming soon. Using sample data for now.`);
        // Fall back to sample import
        await handleSampleImport();
        return;
      }

      // If we have actual transactions, process them
      if (parseResult.transactions.length > 0) {
        setProgress(40);

        // Batch categorize all unique merchants (only for purchases, skip transfers/income)
        const purchaseTransactions = parseResult.transactions.filter(t => !t.transaction_type || t.transaction_type === 'purchase');
        const uniqueMerchants = [...new Set(purchaseTransactions.map(t => t.merchant))];

        console.log(`Batch categorizing ${uniqueMerchants.length} unique merchants...`);
        const categorizations = await window.electronAPI.batchCategorize(uniqueMerchants);

        setProgress(70);

        // Add all transactions to database
        for (const trans of parseResult.transactions) {
          const merchantCategories = categorizations[trans.merchant];

          await window.electronAPI.addTransaction({
            ...trans,
            category: merchantCategories?.category || 'Other',
            // Use transaction_type from parser if available, otherwise use categorization
            transaction_type: trans.transaction_type || merchantCategories?.transactionType || 'purchase',
          });
        }

        setProgress(90);
        const updatedStats = await window.electronAPI.getDashboardStats();
        setStats(updatedStats);
        setProgress(100);
        setComplete(true);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import file. Using sample data instead.');
      await handleSampleImport();
    } finally {
      setImporting(false);
    }
  };

  const handleSampleImport = async () => {
    if (typeof window !== 'undefined') {
      // For demo, let's create some sample transactions
      setImporting(true);
      setProgress(10);

      try {
        const sampleTransactions = [
          {
            date: '2024-01-15',
            merchant: 'STARBUCKS #12345',
            amount: 6.75,
            raw_description: 'STARBUCKS STORE #12345 SEATTLE WA',
          },
          {
            date: '2024-01-16',
            merchant: 'WHOLE FOODS MARKET',
            amount: 87.32,
            raw_description: 'WHOLE FOODS MKT #10250 AUSTIN TX',
          },
          {
            date: '2024-01-17',
            merchant: 'SHELL GAS STATION',
            amount: 45.0,
            raw_description: 'SHELL OIL 57443423232 HOUSTON TX',
          },
          {
            date: '2024-01-18',
            merchant: 'CHIPOTLE',
            amount: 12.5,
            raw_description: 'CHIPOTLE MEXICAN GRILL',
          },
          {
            date: '2024-01-19',
            merchant: 'TARGET',
            amount: 56.78,
            raw_description: 'TARGET T-1234',
          },
        ];

        setProgress(30);

        // Categorize and insert each transaction
        let processed = 0;
        for (const trans of sampleTransactions) {
          // Categorize
          const categorization = await window.electronAPI.categorizeTransaction(trans.merchant);
          setProgress(30 + (processed / sampleTransactions.length) * 50);

          // Insert into database
          await window.electronAPI.addTransaction({
            ...trans,
            category: categorization.category,
            transaction_type: categorization.transactionType,
          });

          processed++;
        }

        setProgress(90);

        // Get updated stats
        const updatedStats = await window.electronAPI.getDashboardStats();
        setStats(updatedStats);

        setProgress(100);
        setComplete(true);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import transactions. Check console for details.');
      } finally {
        setImporting(false);
      }
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Import Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Successfully imported {stats?.transactionCount || 0} transactions
              </p>

              <div className="space-y-2 text-left mb-6 bg-secondary/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Total Spent:</span>
                  <span className="font-semibold">${stats?.totalSpent.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Category:</span>
                  <span className="font-semibold">{stats?.topCategory || 'None'}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button>View Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setComplete(false);
                    setFilePath(null);
                    setProgress(0);
                  }}
                >
                  Import More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Import Transactions</h1>
          <p className="text-muted-foreground mt-2">
            Upload CSV, XLSX, TXT, or PDF files from your bank
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Transaction File</CardTitle>
            <CardDescription>
              Supports CSV, Excel (.xlsx), Text (.txt), and PDF formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!importing ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to select a file
                  </p>
                  <Button onClick={handleFileSelect}>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Or try a demo:</h3>
                  <Button variant="outline" onClick={handleSampleImport} className="w-full">
                    Import Sample Transactions
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p className="font-semibold">Supported formats:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>CSV</strong> - Most banks (comma or tab delimited)</li>
                    <li><strong>XLSX/XLS</strong> - Bank of America, Excel exports</li>
                    <li><strong>TXT</strong> - Bank of America plain text</li>
                    <li><strong>PDF</strong> - Chase statements</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-center mb-6">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Importing Transactions...</h3>
                  <p className="text-sm text-muted-foreground">
                    Categorizing with AI and saving to database
                  </p>
                </div>

                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">{progress}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4">
          <Link href="/">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
