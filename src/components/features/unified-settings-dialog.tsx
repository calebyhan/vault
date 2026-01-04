'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Trash2, 
  Palette, 
  Download, 
  Upload, 
  Database,
  Moon,
  Sun,
  DollarSign,
  Calendar,
  List,
  Key
} from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants/categories';

interface UnifiedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paginationEnabled?: boolean;
  setPaginationEnabled?: (enabled: boolean) => void;
  itemsPerPage?: number;
  setItemsPerPage?: (items: number) => void;
  transactionCount?: number;
  onDeleteAll?: () => void;
}

export function UnifiedSettingsDialog({
  open,
  onOpenChange,
  paginationEnabled = true,
  setPaginationEnabled,
  itemsPerPage = 50,
  setItemsPerPage,
  transactionCount = 0,
  onDeleteAll,
}: UnifiedSettingsDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  
  // Theme settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Currency settings
  const [currencyFormat, setCurrencyFormat] = useState<'symbol' | 'code'>('symbol');
  
  // Date settings
  const [dateFormat, setDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY'>('MM/DD/YYYY');
  
  // API Key
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Category customization (placeholder for future implementation)
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    // Load settings from localStorage or electron store
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    const savedCurrencyFormat = localStorage.getItem('currencyFormat') as 'symbol' | 'code' || 'symbol';
    const savedDateFormat = localStorage.getItem('dateFormat') as 'MM/DD/YYYY' | 'DD/MM/YYYY' || 'MM/DD/YYYY';

    setTheme(savedTheme);
    setCurrencyFormat(savedCurrencyFormat);
    setDateFormat(savedDateFormat);

    // Load API key if available
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // TODO: Implement getApiKey in electron
      // (window as any).electronAPI.getApiKey().then(key => setGeminiApiKey(key || ''));
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleCurrencyFormatChange = (format: 'symbol' | 'code') => {
    setCurrencyFormat(format);
    localStorage.setItem('currencyFormat', format);
  };

  const handleDateFormatChange = (format: 'MM/DD/YYYY' | 'DD/MM/YYYY') => {
    setDateFormat(format);
    localStorage.setItem('dateFormat', format);
  };

  const handleSaveApiKey = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // TODO: Implement saveApiKey in electron
      // await (window as any).electronAPI.saveApiKey(geminiApiKey);
      console.log('Saving API key:', geminiApiKey);
    }
  };

  const handleExportData = async (format: 'csv' | 'html') => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        let filePath;
        if (format === 'csv') {
          filePath = await (window as any).electronAPI.exportTransactionsCSV();
        } else if (format === 'html') {
          filePath = await (window as any).electronAPI.exportTransactionsPDF();
        }

        if (filePath) {
          alert(`Export successful! File saved to:\n${filePath}`);
        }
      } catch (error) {
        console.error('Export error:', error);
        alert(`Export failed: ${error}`);
      }
    }
  };

  const handleBackupDatabase = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // TODO: Implement backup functionality
      console.log('Backing up database');
    }
  };

  const handleRestoreDatabase = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // TODO: Implement restore functionality
      console.log('Restoring database');
    }
  };

  const handleClearAllData = async () => {
    if (onDeleteAll) {
      onDeleteAll();
      setClearConfirmOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent 
          className="max-w-4xl max-h-[85vh] overflow-y-auto"
          onEscapeKeyDown={() => onOpenChange(false)}
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </AlertDialogTitle>
            <AlertDialogDescription>
              Customize your experience and manage your data
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-4">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Theme
                  </CardTitle>
                  <CardDescription>
                    Choose between light and dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('light')}
                      className="flex-1"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('dark')}
                      className="flex-1"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Currency Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Currency Format
                  </CardTitle>
                  <CardDescription>
                    How currency values are displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="currency-symbol"
                      name="currency"
                      checked={currencyFormat === 'symbol'}
                      onChange={() => handleCurrencyFormatChange('symbol')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="currency-symbol" className="cursor-pointer">
                      Symbol ($1,234.56)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="currency-code"
                      name="currency"
                      checked={currencyFormat === 'code'}
                      onChange={() => handleCurrencyFormatChange('code')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="currency-code" className="cursor-pointer">
                      Code (USD 1,234.56)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Date Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Format
                  </CardTitle>
                  <CardDescription>
                    How dates are displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="date-mdy"
                      name="date"
                      checked={dateFormat === 'MM/DD/YYYY'}
                      onChange={() => handleDateFormatChange('MM/DD/YYYY')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="date-mdy" className="cursor-pointer">
                      MM/DD/YYYY (12/31/2025)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="date-dmy"
                      name="date"
                      checked={dateFormat === 'DD/MM/YYYY'}
                      onChange={() => handleDateFormatChange('DD/MM/YYYY')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="date-dmy" className="cursor-pointer">
                      DD/MM/YYYY (31/12/2025)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {setPaginationEnabled && setItemsPerPage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Pagination
                    </CardTitle>
                    <CardDescription>
                      Control how many transactions are displayed per page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pagination-toggle">Enable Pagination</Label>
                      <Switch
                        id="pagination-toggle"
                        checked={paginationEnabled}
                        onCheckedChange={setPaginationEnabled}
                      />
                    </div>

                    {paginationEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="items-per-page">Items per page</Label>
                        <select
                          id="items-per-page"
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="10">10 transactions</option>
                          <option value="25">25 transactions</option>
                          <option value="50">50 transactions</option>
                          <option value="100">100 transactions</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Higher values may slow down performance with many transactions
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Category Colors
                  </CardTitle>
                  <CardDescription>
                    Customize the colors used for each category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: CATEGORY_COLORS[category] }}
                          />
                          <input
                            type="color"
                            value={CATEGORY_COLORS[category]}
                            onChange={(e) => {
                              // TODO: Implement color change
                              console.log(`Change ${category} to ${e.target.value}`);
                            }}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: Custom category management (add/remove/rename) coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Gemini API Key
                  </CardTitle>
                  <CardDescription>
                    Configure your Google Gemini API key for AI-powered categorization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSaveApiKey} disabled={!geminiApiKey}>
                    Save API Key
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Get your API key at{' '}
                    <a
                      href="https://ai.google.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      https://ai.google.dev/
                    </a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data" className="space-y-4">
              {/* Export Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Download all your transaction data
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportData('csv')}
                    className="flex-1"
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportData('html')}
                    className="flex-1"
                  >
                    Export as HTML Report
                  </Button>
                </CardContent>
              </Card>

              {/* Database Backup/Restore */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Management
                  </CardTitle>
                  <CardDescription>
                    Backup and restore your database
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBackupDatabase}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Backup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRestoreDatabase}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that permanently delete data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Delete All Transactions</p>
                      <p className="text-xs text-muted-foreground">
                        Permanently remove all {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} from the database
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setClearConfirmOpen(true);
                      }}
                      disabled={transactionCount === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent
          onEscapeKeyDown={() => setClearConfirmOpen(false)}
          onPointerDownOutside={() => setClearConfirmOpen(false)}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {transactionCount} transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
