// src/features/CheckYourAnswers/utils/applicationSummaryFormatters.ts

import { EMPTY_VALUE } from '../constants/applicationSummaryLabels';

/**
 * Format currency for display (GBP)
 * @param amount - Amount in smallest currency unit (pence)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return EMPTY_VALUE;
  const pounds = amount / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(pounds);
};

/**
 * Format date for display (DD Month YYYY)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDisplayDate = (dateString?: string): string => {
  if (!dateString) return EMPTY_VALUE;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return EMPTY_VALUE;
  }
};

/**
 * Format number with commas for readability
 * @param value - Numeric value
 * @returns Formatted number string
 */
export const formatNumber = (value?: number | string): string => {
  if (value === undefined || value === null || value === '') return EMPTY_VALUE;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return EMPTY_VALUE;
  return new Intl.NumberFormat('en-GB').format(numValue);
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text?: string, maxLength: number = 100): string => {
  if (!text) return EMPTY_VALUE;
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format boolean value for display
 * @param value - Boolean value
 * @returns 'Yes', 'No', or empty value
 */
export const formatBoolean = (value?: boolean | null): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  return value ? 'Yes' : 'No';
};

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return EMPTY_VALUE;
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};