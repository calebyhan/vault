/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Handles various input formats:
 * - YYYY-MM-DD (already correct)
 * - YYYY/MM/DD (needs conversion)
 * - MM/DD/YYYY (needs conversion)
 * - ISO string with timestamp
 */
export function normalizeDateToISO(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // Remove any whitespace
  const trimmed = date.trim();

  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // If it's an ISO string with timestamp, extract date part
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.split('T')[0];
  }

  // Handle YYYY/MM/DD format
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Handle MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [month, day, year] = trimmed.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try to parse as Date and convert
  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error(`Failed to parse date: "${date}"`, error);
  }

  // If all else fails, return original
  console.warn(`Could not normalize date: "${date}" - returning as-is`);
  return trimmed;
}

/**
 * Validate if a string is a valid date in YYYY-MM-DD format
 */
export function isValidISODate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Format a date string for display (can customize this as needed)
 */
export function formatDateForDisplay(date: string): string {
  const normalized = normalizeDateToISO(date);
  const parsed = new Date(normalized);
  
  if (isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Check if a date is problematic (incomplete, malformed, or missing year)
 */
export function isProblematicDate(date: string): boolean {
  if (!date) return true;
  
  const trimmed = date.trim();
  
  // Check if date is too short (less than 8 chars like YYYY-M-D)
  if (trimmed.length < 8) return true;
  
  // Check if date doesn't match expected formats
  const validFormats = [
    /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{1,2}\/\d{1,2}\/\d{4}$/ // MM/DD/YYYY
  ];
  
  const matchesFormat = validFormats.some(pattern => pattern.test(trimmed));
  if (!matchesFormat) return true;
  
  // Check if date can be parsed
  try {
    const normalized = normalizeDateToISO(trimmed);
    const parsed = new Date(normalized);
    if (isNaN(parsed.getTime())) return true;
    
    // Check if year is reasonable (between 2000 and current year + 1)
    const year = parsed.getFullYear();
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) return true;
  } catch {
    return true;
  }
  
  return false;
}
