'use client';

import { useState } from 'react';
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
import { Settings, Trash2 } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paginationEnabled: boolean;
  setPaginationEnabled: (enabled: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  transactionCount: number;
  onDeleteAll: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  paginationEnabled,
  setPaginationEnabled,
  itemsPerPage,
  setItemsPerPage,
  transactionCount,
  onDeleteAll,
}: SettingsDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent 
          className="max-w-2xl"
          onEscapeKeyDown={() => onOpenChange(false)}
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Transaction Settings
            </AlertDialogTitle>
            <AlertDialogDescription>
              Customize how transactions are displayed and manage your data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Pagination Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pagination</CardTitle>
                <CardDescription>
                  Control how many transactions are displayed per page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pagination-toggle-settings"
                    checked={paginationEnabled}
                    onChange={(e) => setPaginationEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="pagination-toggle-settings" className="text-sm font-medium cursor-pointer">
                    Enable Pagination
                  </label>
                </div>

                {paginationEnabled && (
                  <div className="pl-6 space-y-2">
                    <label htmlFor="items-per-page-settings" className="text-sm font-medium block">
                      Items per page
                    </label>
                    <select
                      id="items-per-page-settings"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="25">25 transactions</option>
                      <option value="50">50 transactions</option>
                      <option value="100">100 transactions</option>
                      <option value="200">200 transactions</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Higher values may slow down performance with many transactions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
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
                      setDeleteConfirmOpen(true);
                      onOpenChange(false);
                    }}
                    disabled={transactionCount === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent
          onEscapeKeyDown={() => setDeleteConfirmOpen(false)}
          onPointerDownOutside={() => setDeleteConfirmOpen(false)}
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
              onClick={() => {
                onDeleteAll();
                setDeleteConfirmOpen(false);
              }}
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
