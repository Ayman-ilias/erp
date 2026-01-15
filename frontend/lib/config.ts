/**
 * Application Configuration
 *
 * Centralized configuration constants to avoid hardcoded values throughout the codebase.
 * All configurable values should be defined here and referenced from this file.
 */

// ============================================================================
// App Configuration (Branding & Identity)
// ============================================================================

export const APP_CONFIG = {
  /** Application name - used in titles, headers, etc. */
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "Southern Apparels",
  /** Full company name */
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "Southern Apparels and Holdings",
  /** Short company code (used in IDs like SCLPO) */
  COMPANY_CODE: process.env.NEXT_PUBLIC_COMPANY_CODE || "SCL",
  /** Application description */
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "ERP System",
  /** Logo path */
  LOGO_PATH: "/logo.jpeg",
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  /** Base path for API requests (masked URL) */
  BASE_PATH: process.env.NEXT_PUBLIC_API_MASK_URL || "/api/v1",
  /** Backend server URL - MUST be set via environment variable for server-side rendering */
  /** In browser, this is not used (API masking via next.config.ts rewrites) */
  BACKEND_URL: (() => {
    // Server-side: must be provided via env var
    if (typeof window === "undefined") {
      const url = process.env.BACKEND_URL || process.env.API_URL;
      if (!url) {
        console.warn("BACKEND_URL or API_URL not set - using Docker default fallback");
        return "http://backend:8000"; // Docker default fallback
      }
      return url;
    }
    // Browser: not used (API masking handles routing via Next.js rewrites/API routes)
    return "";
  })(),
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 30000,
} as const;

// ============================================================================
// Frontend URLs
// ============================================================================

export const FRONTEND_CONFIG = {
  /** Base URL for the frontend - uses window.location in browser, env var on server */
  BASE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""),
  /** Server port - read from environment */
  PORT: process.env.PORT || process.env.FRONTEND_PORT || "2222",
} as const;

// ============================================================================
// Authentication Configuration
// ============================================================================

export const AUTH_CONFIG = {
  /** Cookie name for storing auth token */
  COOKIE_NAME: process.env.NEXT_PUBLIC_USER_COOKIE || "sa-erp-user",
  /** Legacy cookie name (for migration) */
  LEGACY_COOKIE_NAME: "auth_token",
  /** Storage key for encrypted token */
  TOKEN_STORAGE_KEY: "encrypted_token",
  /** Storage key for encrypted user data */
  USER_STORAGE_KEY: "encrypted_user",
  /** Legacy storage key for token */
  LEGACY_TOKEN_KEY: "token",
  /** Legacy storage key for user */
  LEGACY_USER_KEY: "user",
  /** Cookie expiry in days */
  COOKIE_EXPIRY_DAYS: 7,
} as const;

// ============================================================================
// API Limits
// ============================================================================

export const API_LIMITS = {
  /** Default limit for list queries */
  DEFAULT: 10000,
  /** Limit for styles queries */
  STYLES: 1000,
  /** Limit for style variants queries */
  STYLE_VARIANTS: 1000,
} as const;

// ============================================================================
// Image Configuration
// ============================================================================

export const IMAGE_CONFIG = {
  /** Allowed hostnames for next/image - MUST be set via environment variable */
  ALLOWED_HOSTNAMES: process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(",").filter(Boolean) || [],
  /** Default avatar placeholder URL */
  AVATAR_PLACEHOLDER: process.env.NEXT_PUBLIC_AVATAR_PLACEHOLDER || "/avatars/default.png",
} as const;

// ============================================================================
// ID Generation Configuration
// ============================================================================

export const ID_CONFIG = {
  /** Prefix for PO numbers */
  PO_PREFIX: process.env.NEXT_PUBLIC_PO_PREFIX || `${APP_CONFIG.COMPANY_CODE}PO`,
} as const;

