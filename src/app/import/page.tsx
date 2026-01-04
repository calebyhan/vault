'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { ColumnMapper } from '@/components/features/import/column-mapper';
import { ImportPreview } from '@/components/features/import/import-preview';
import { DuplicateWarning } from '@/components/features/import/duplicate-warning';

type ImportStep = 'select' | 'mapping' | 'preview' | 'importing' | 'complete';

interface FileData {
  path: string;
  filename: string;
  parseResult: any;
  needsMapping: boolean;
}

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('select');
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  // Check for duplicate transactions in the database
  const checkForDuplicates = async (transactions: any[]) => {
    if (typeof window === 'undefined' || !(window as any).electronAPI) return;

    try {
      const foundDuplicates = await (window as any).electronAPI.findDuplicates(transactions);
      setDuplicates(foundDuplicates);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Don't fail the import if duplicate check fails
      setDuplicates([]);
    }
  };

  // Remove duplicate transactions from the import list
  const handleRemoveDuplicates = (duplicateIndices: number[]) => {
    // Create a Set of transactions to remove based on the duplicate matches
    const transactionsToRemove = new Set<string>();

    duplicateIndices.forEach(idx => {
      const dup = duplicates[idx];
      if (dup?.newTransaction) {
        // Create a unique key for the transaction
        const key = `${dup.newTransaction.date}-${dup.newTransaction.merchant}-${dup.newTransaction.amount}`;
        transactionsToRemove.add(key);
      }
    });

    // Filter out the duplicate transactions
    const filtered = allTransactions.filter(trans => {
      const key = `${trans.date}-${trans.merchant}-${trans.amount}`;
      return !transactionsToRemove.has(key);
    });

    setAllTransactions(filtered);

    // Clear the duplicates list
    setDuplicates([]);
  };

  // Process file paths (used by both dialog and drag-and-drop)
  const processFilePaths = async (filePaths: string[]) => {
    if (!window.electronAPI) {
      alert('This feature requires Electron. Please run: npm run dev');
      return;
    }

    try {
      // Parse all selected files
      const parsedFiles: FileData[] = [];
      for (const path of filePaths) {
        const parseResult = await window.electronAPI.parseFile(path);
        const filename = path.split('/').pop() || path.split('\\').pop() || path;

        parsedFiles.push({
          path,
          filename,
          parseResult,
          needsMapping: parseResult.headers && parseResult.transactions.length === 0,
        });
      }

      setFiles(parsedFiles);

      // Check if any file needs mapping
      const needsMapping = parsedFiles.some(f => f.needsMapping);
      if (needsMapping) {
        setCurrentFileIndex(parsedFiles.findIndex(f => f.needsMapping));
        setStep('mapping');
      } else {
        // All files parsed successfully, combine all transactions
        const combined = parsedFiles.flatMap(f => f.parseResult.transactions);
        setAllTransactions(combined);

        // Check for duplicates
        await checkForDuplicates(combined);

        setStep('preview');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert(`Error: ${error}`);
    }
  };

  // Select multiple files via dialog
  const handleFileSelect = async () => {
    if (!window.electronAPI) {
      alert('This feature requires Electron. Please run: npm run dev');
      return;
    }

    try {
      const selectedPaths = await window.electronAPI.selectMultipleFiles();
      if (!selectedPaths || selectedPaths.length === 0) {
        return;
      }
      await processFilePaths(selectedPaths);
    } catch (error) {
      console.error('Error selecting files:', error);
      alert(`Error: ${error}`);
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Filter for supported file types
    const supportedExts = ['csv', 'xlsx', 'xls', 'txt', 'pdf'];
    const validFiles = droppedFiles.filter(file => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ext && supportedExts.includes(ext);
    });

    if (validFiles.length === 0) {
      alert('No supported files found. Please drop CSV, XLSX, TXT, or PDF files.');
      return;
    }

    // Get file paths from the File objects
    const filePaths = validFiles.map(file => (file as any).path);
    await processFilePaths(filePaths);
  };

  // Handle column mapping submission
  const handleMappingSubmit = async (mapping: { date: string; merchant: string; amount: string }) => {
    if (!window.electronAPI) {
      alert('This feature requires Electron. Please run: npm run dev');
      return;
    }

    const currentFile = files[currentFileIndex];

    try {
      // Re-parse with manual mapping
      const parseResult = await window.electronAPI.parseFile(currentFile.path, mapping);

      // Update the file data
      const updatedFiles = [...files];
      updatedFiles[currentFileIndex] = {
        ...currentFile,
        parseResult,
        needsMapping: false,
      };
      setFiles(updatedFiles);

      // Check if more files need mapping
      const nextNeedsMapping = updatedFiles.findIndex((f, i) => i > currentFileIndex && f.needsMapping);
      if (nextNeedsMapping !== -1) {
        setCurrentFileIndex(nextNeedsMapping);
      } else {
        // All files mapped, combine transactions
        const combined = updatedFiles.flatMap(f => f.parseResult.transactions);
        setAllTransactions(combined);

        // Check for duplicates
        await checkForDuplicates(combined);

        setStep('preview');
      }
    } catch (error) {
      console.error('Error re-parsing with mapping:', error);
      alert('Failed to parse file with mapping');
    }
  };

  // Handle import confirmation from preview
  const handleImportConfirm = async () => {
    if (!window.electronAPI) {
      alert('This feature requires Electron. Please run: npm run dev');
      return;
    }

    setStep('importing');
    setProgress(10);

    try {
      // Get unique merchants for batch categorization
      const purchaseTransactions = allTransactions.filter(
        t => !t.transaction_type || t.transaction_type === 'purchase'
      );
      const uniqueMerchants = [...new Set(purchaseTransactions.map(t => t.merchant))];

      setProgress(30);

      // Batch categorize
      console.log(`Batch categorizing ${uniqueMerchants.length} unique merchants...`);
      const categorizations = await window.electronAPI.batchCategorize(uniqueMerchants);

      setProgress(60);

      // Add all transactions to database
      // Currency conversion will happen automatically in the IPC handler
      for (let i = 0; i < allTransactions.length; i++) {
        const trans = allTransactions[i];
        const merchantCategories = categorizations.get(trans.merchant);

        await window.electronAPI.addTransaction({
          date: trans.date,
          merchant: trans.merchant,
          amount: trans.amount, // Original amount
          category: merchantCategories?.category || 'Other',
          transaction_type: trans.transaction_type || merchantCategories?.transactionType || 'purchase',
          raw_description: trans.raw_description,
          original_currency: trans.currency || 'USD', // Pass currency from parser
          original_amount: trans.amount, // Original amount in original currency
        });

        // Update progress
        setProgress(60 + (i / allTransactions.length) * 30);
      }

      setProgress(95);
      const updatedStats = await window.electronAPI.getDashboardStats();
      setStats(updatedStats);
      setProgress(100);
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import transactions. Check console for details.');
      setStep('select');
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    setFiles([]);
    setAllTransactions([]);
    setCurrentFileIndex(0);
    setStep('select');
  };

  // Render based on step
  if (step === 'complete') {
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
                Successfully imported {allTransactions.length} transactions from {files.length} file{files.length !== 1 ? 's' : ''}
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
                    setStep('select');
                    setFiles([]);
                    setAllTransactions([]);
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

  if (step === 'importing') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="py-8">
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
              <p className="text-center text-sm text-muted-foreground mt-2">{progress.toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'mapping') {
    const currentFile = files[currentFileIndex];
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Column Mapping</h1>
            <p className="text-muted-foreground mt-2">
              File {currentFileIndex + 1} of {files.length}: {currentFile.filename}
            </p>
          </div>

          <ColumnMapper
            headers={currentFile.parseResult.headers}
            onMapping={handleMappingSubmit}
            onCancel={handleCancel}
          />

          <div className="mt-4">
            <Link href="/">
              <Button variant="ghost">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Preview Import</h1>
            <p className="text-muted-foreground mt-2">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* File list */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{file.filename}</span>
                    <span className="text-muted-foreground">
                      {file.parseResult.transactions.length} transactions
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duplicate warning */}
          {duplicates.length > 0 && (
            <div className="mb-6">
              <DuplicateWarning
                duplicates={duplicates}
                onRemoveDuplicates={handleRemoveDuplicates}
              />
            </div>
          )}

          <ImportPreview
            transactions={allTransactions}
            totalCount={allTransactions.length}
            onConfirm={handleImportConfirm}
            onCancel={handleCancel}
          />

          <div className="mt-4">
            <Link href="/">
              <Button variant="ghost">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: select step
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
            <CardTitle>Upload Transaction Files</CardTitle>
            <CardDescription>
              Select one or multiple files. Supports CSV, Excel (.xlsx), Text (.txt), and PDF formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="text-sm text-muted-foreground mb-4">
                  {isDragging ? 'Drop files here...' : 'Click to select file(s) or drag and drop'}
                </p>
                <Button onClick={handleFileSelect} disabled={isDragging}>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Supports multiple file selection and different file types
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                <p className="font-semibold">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>CSV</strong> - Most banks (comma or tab delimited)</li>
                  <li><strong>XLSX/XLS</strong> - Bank of America, Excel exports</li>
                  <li><strong>TXT</strong> - Bank of America plain text</li>
                  <li><strong>PDF</strong> - Chase statements (experimental)</li>
                </ul>
              </div>
            </div>
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
