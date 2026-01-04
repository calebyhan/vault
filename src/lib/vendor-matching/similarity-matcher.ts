import { extractVendorCore } from './vendor-extractor';

export interface SimilarityScore {
  score: number;
  method: 'jaro-winkler' | 'token' | 'exact';
}

/**
 * Common abbreviations found in merchant names
 */
const ABBREVIATIONS: Record<string, string> = {
  'MKT': 'MARKET',
  'MKTPL': 'MARKETPLACE',
  'MKTP': 'MARKETPLACE',
  'ST': 'STREET',
  'AVE': 'AVENUE',
  'BLVD': 'BOULEVARD',
  'CORP': 'CORPORATION',
  'INC': 'INCORPORATED',
  'INTL': 'INTERNATIONAL',
  'NATL': 'NATIONAL',
  'SVC': 'SERVICE',
  'SVCS': 'SERVICES',
  'CO': 'COMPANY',
  'DEPT': 'DEPARTMENT',
  'DELI': 'DELICATESSEN',
  'REST': 'RESTAURANT',
  'CAFE': 'COFFEE',
};

/**
 * Expand common abbreviations in text
 */
export function expandAbbreviations(text: string): string {
  let expanded = text;
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    expanded = expanded.replace(regex, full);
  }
  return expanded;
}

/**
 * Calculate Jaro-Winkler distance between two strings
 * Returns a value between 0.0 (completely different) and 1.0 (identical)
 * Jaro-Winkler gives more weight to strings that match at the beginning
 */
export function jaroWinklerDistance(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0.0;

  // Match window: max(len1, len2) / 2 - 1
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  if (matchWindow < 0) return s1 === s2 ? 1.0 : 0.0;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  // Calculate Jaro similarity
  const jaro = (
    matches / len1 +
    matches / len2 +
    (matches - transpositions / 2) / matches
  ) / 3;

  // Apply Winkler modification
  // Find common prefix length (up to 4 characters)
  let prefixLength = 0;
  for (let i = 0; i < Math.min(4, len1, len2); i++) {
    if (s1[i] === s2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  const p = 0.1; // Winkler scaling factor
  return jaro + prefixLength * p * (1 - jaro);
}

/**
 * Calculate token-based similarity using Jaccard index
 * Good for multi-word vendors where word order might differ
 */
export function tokenSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(s1.split(' ').filter(t => t.length > 0));
  const tokens2 = new Set(s2.split(' ').filter(t => t.length > 0));

  if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  // Calculate intersection
  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));

  // Calculate union
  const union = new Set([...tokens1, ...tokens2]);

  // Jaccard similarity = intersection / union
  return intersection.size / union.size;
}

/**
 * Calculate similarity between two merchant names
 * Returns a score between 0.0 and 1.0 and the method used
 */
export function calculateSimilarity(merchant1: string, merchant2: string): SimilarityScore {
  // Exact match
  if (merchant1 === merchant2) {
    return { score: 1.0, method: 'exact' };
  }

  // Extract core vendor names
  const extract1 = extractVendorCore(merchant1);
  const extract2 = extractVendorCore(merchant2);

  const core1 = extract1.coreName;
  const core2 = extract2.coreName;

  // Exact core match (ignoring store ID/location)
  if (core1 === core2) {
    return { score: 0.98, method: 'exact' };
  }

  // Expand abbreviations
  const expanded1 = expandAbbreviations(core1);
  const expanded2 = expandAbbreviations(core2);

  // Check after abbreviation expansion
  if (expanded1 === expanded2) {
    return { score: 0.95, method: 'exact' };
  }

  // Token-based for multi-word (>= 2 words)
  const words1 = expanded1.split(' ');
  const words2 = expanded2.split(' ');

  if (words1.length >= 2 || words2.length >= 2) {
    const tokenScore = tokenSimilarity(expanded1, expanded2);
    if (tokenScore >= 0.5) {
      return { score: tokenScore, method: 'token' };
    }
  }

  // Jaro-Winkler for general similarity
  const jwScore = jaroWinklerDistance(expanded1, expanded2);

  return { score: jwScore, method: 'jaro-winkler' };
}
