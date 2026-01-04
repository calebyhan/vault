import { Transaction } from './transaction';

export interface VendorExtraction {
  coreName: string;
  storeId?: string;
  location?: string;
  originalMerchant: string;
}

export interface SimilarityScore {
  score: number;
  method: 'jaro-winkler' | 'token' | 'exact';
}

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

export interface FindSimilarResult {
  target: Transaction;
  similar: SimilarTransaction[];
  grouped: SimilarVendorGroup[];
}
