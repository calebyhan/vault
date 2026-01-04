import type { Transaction } from '../types/transaction';
import { extractVendorCore, VendorExtraction } from './vendor-extractor';
import { calculateSimilarity, SimilarityScore } from './similarity-matcher';

export interface SimilarTransaction {
  transaction: Transaction;
  similarity: SimilarityScore;
  extraction: VendorExtraction;
}

export interface SimilarVendorGroup {
  coreName: string;
  transactions: SimilarTransaction[];
  averageSimilarity: number;
}

export type { VendorExtraction, SimilarityScore };

/**
 * Find transactions with similar vendor names
 * @param targetTransaction The transaction to find similar vendors for
 * @param allTransactions All transactions to search through
 * @param threshold Minimum similarity score (0.0 - 1.0) to consider similar
 * @returns Array of similar transactions sorted by similarity score
 */
export function findSimilarTransactions(
  targetTransaction: Transaction,
  allTransactions: Transaction[],
  threshold: number = 0.70
): SimilarTransaction[] {
  const targetExtraction = extractVendorCore(targetTransaction.merchant);
  const similar: SimilarTransaction[] = [];

  for (const transaction of allTransactions) {
    // Skip the target itself
    if (transaction.id === targetTransaction.id) continue;

    const extraction = extractVendorCore(transaction.merchant);
    const similarity = calculateSimilarity(
      targetExtraction.coreName,
      extraction.coreName
    );

    if (similarity.score >= threshold) {
      similar.push({
        transaction,
        similarity,
        extraction,
      });
    }
  }

  // Sort by similarity score (descending)
  return similar.sort((a, b) => b.similarity.score - a.similarity.score);
}

/**
 * Group similar transactions by their core vendor name
 * @param similar Array of similar transactions
 * @returns Array of vendor groups
 */
export function groupSimilarTransactions(
  similar: SimilarTransaction[]
): SimilarVendorGroup[] {
  // Group by core name
  const groups = new Map<string, SimilarTransaction[]>();

  for (const item of similar) {
    const key = item.extraction.coreName;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  // Convert to array and calculate average similarity
  return Array.from(groups.entries()).map(([coreName, transactions]) => ({
    coreName,
    transactions,
    averageSimilarity:
      transactions.reduce((sum, t) => sum + t.similarity.score, 0) /
      transactions.length,
  }));
}

// Re-export utilities for convenience
export { extractVendorCore } from './vendor-extractor';
export { calculateSimilarity, expandAbbreviations, jaroWinklerDistance, tokenSimilarity } from './similarity-matcher';
