/**
 * Core Utilities for Southern Apparels ERP
 *
 * This file contains reusable utility functions used across the application.
 * For shadcn/ui components, the cn() function is essential.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// CLASS NAME UTILITIES
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence
 * Required by all shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert snake_case or kebab-case to Title Case
 */
export function formatLabel(str: string): string {
  if (!str) return "";
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number as percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format date to locale string
 */
export function formatDate(
  date: string | Date,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, options);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date, locale: string = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Group array by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sort array by key
 */
export function sortBy<T>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>
  );
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Remove null/undefined values from object
 */
export function compact<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null)
  ) as Partial<T>;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if value is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if value is a valid phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// ID UTILITIES
// ============================================================================

/**
 * Generate a simple unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Generate order/style number with prefix and date
 */
export function generateOrderNo(prefix: string = "ORD"): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}${month}-${random}`;
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

// ============================================================================
// DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download data as file
 */
export function downloadFile(
  data: string | Blob,
  filename: string,
  mimeType: string = "application/octet-stream"
): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download JSON as file
 */
export function downloadJson(data: object, filename: string): void {
  downloadFile(JSON.stringify(data, null, 2), filename, "application/json");
}
