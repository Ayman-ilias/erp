/**
 * Router Configuration for Southern Apparels ERP
 *
 * LINKS - Frontend navigation paths (for Next.js routing)
 * PATHS - Backend API endpoint paths (for API calls)
 */

import { API_LIMITS } from "@/lib/config";

// ============================================================================
// LINKS - Frontend Routes
// ============================================================================

export const LINKS = {
  // Auth Routes (Root Level)
  HOME: "/" as const,
  LOGIN: "/login" as const,
  REGISTER: "/register" as const,
  FORGOT_PASSWORD: "/forgot-password" as const,

  // Dashboard
  DASHBOARD: () => ({
    path: "/dashboard/erp" as const,
  }),

  // Client Management
  CLIENTS: {
    BUYERS: () => ({ path: "/dashboard/erp/clients/buyers" as const }),
    SUPPLIERS: () => ({ path: "/dashboard/erp/clients/suppliers" as const }),
    CONTACTS: () => ({ path: "/dashboard/erp/clients/contacts" as const }),
    SHIPPING: () => ({ path: "/dashboard/erp/clients/shipping" as const }),
    BANKING: () => ({ path: "/dashboard/erp/clients/banking" as const }),
  } as const,

  // Samples Department
  SAMPLES: {
    LIST: () => ({ path: "/dashboard/erp/samples" as const }),
    STYLE_SUMMARY: () => ({
      path: "/dashboard/erp/samples/style-summary" as const,
    }),
    STYLE_VARIANTS: () => ({
      path: "/dashboard/erp/samples/style-variants" as const,
    }),
    ADD_MATERIAL: () => ({
      path: "/dashboard/erp/samples/add-material" as const,
    }),
    REQUIRED_MATERIALS: () => ({
      path: "/dashboard/erp/samples/required-materials" as const,
    }),
    PRIMARY: () => ({ path: "/dashboard/erp/samples/primary" as const }),
    TNA: () => ({ path: "/dashboard/erp/samples/tna" as const }),
    PLAN: () => ({ path: "/dashboard/erp/samples/plan" as const }),
    OPERATIONS: () => ({ path: "/dashboard/erp/samples/operations" as const }),
    MANUFACTURING_OPERATIONS: () => ({ path: "/dashboard/erp/samples/manufacturing-operations" as const }),
    WORKFLOW_DASHBOARD: () => ({ path: "/dashboard/erp/samples/workflow-dashboard" as const }),
    WORKFLOW_BOARD: () => ({ path: "/dashboard/erp/samples/workflow-board" as const }),
    SMV: () => ({ path: "/dashboard/erp/samples/smv" as const }),
    MRP: () => ({ path: "/dashboard/erp/samples/mrp" as const }),
  } as const,

  // Orders
  ORDERS: {
    LIST: () => ({ path: "/dashboard/erp/orders" as const }),
    DETAIL: (orderId: string | number) => ({
      path: `/dashboard/erp/orders/${orderId}` as const,
    }),
  } as const,

  // Merchandising
  MERCHANDISING: {
    DASHBOARD: () => ({ path: "/dashboard/erp/merchandising" as const }),
    MATERIAL_DETAILS: () => ({ path: "/dashboard/erp/merchandising/material-details" as const }),
    SIZE_DETAILS: () => ({ path: "/dashboard/erp/merchandising/size-details" as const }),
    SAMPLE_DEVELOPMENT: () => ({ path: "/dashboard/erp/merchandising/sample-development" as const }),
    STYLE_MANAGEMENT: () => ({ path: "/dashboard/erp/merchandising/style-management" as const }),
    STYLE_VARIANTS: () => ({ path: "/dashboard/erp/merchandising/style-variants" as const }),
    CM_CALCULATION: () => ({ path: "/dashboard/erp/merchandising/cm-calculation" as const }),
  } as const,

  // Other Modules
  PRODUCTION: () => ({ path: "/dashboard/erp/production" as const }),
  INVENTORY: () => ({ path: "/dashboard/erp/inventory" as const }),
  REPORTS: () => ({ path: "/dashboard/erp/reports" as const }),
  USERS: () => ({ path: "/dashboard/erp/users" as const }),
  STYLES: () => ({ path: "/dashboard/erp/styles" as const }),
} as const;

// ============================================================================
// PATHS - Backend API Endpoints
// ============================================================================

export const PATHS = {
  // Authentication
  AUTH: {
    LOGIN: () => ({ root: "/auth/login" as const }),
    LOGOUT: () => ({ root: "/auth/logout" as const }),
    REGISTER: () => ({ root: "/auth/register" as const }),
    ME: () => ({ root: "/auth/me" as const }),
    FORGOT_PASSWORD: () => ({ root: "/auth/forgot-password" as const }),
    RESET_PASSWORD: () => ({ root: "/auth/reset-password" as const }),
  } as const,

  // Users
  USERS: {
    LIST: (limit?: number) => ({
      root: `/users${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/users/${id}` as const }),
    CREATE: () => ({ root: "/users" as const }),
    UPDATE: (id: number) => ({ root: `/users/${id}` as const }),
    DELETE: (id: number) => ({ root: `/users/${id}` as const }),
  } as const,

  // Buyers
  BUYERS: {
    LIST: (limit?: number) => ({
      root: `/buyers${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/buyers/${id}` as const }),
    CREATE: () => ({ root: "/buyers" as const }),
    UPDATE: (id: number) => ({ root: `/buyers/${id}` as const }),
    DELETE: (id: number) => ({ root: `/buyers/${id}` as const }),
    TYPES: {
      LIST: (isActive?: boolean) => ({
        root: `/buyers/types${isActive !== undefined ? `?is_active=${isActive}` : ""}` as const,
      }),
      DETAIL: (id: number) => ({ root: `/buyers/types/${id}` as const }),
      CREATE: () => ({ root: "/buyers/types" as const }),
      UPDATE: (id: number) => ({ root: `/buyers/types/${id}` as const }),
      DELETE: (id: number) => ({ root: `/buyers/types/${id}` as const }),
    } as const,
  } as const,

  // Suppliers
  SUPPLIERS: {
    LIST: (limit?: number) => ({
      root: `/suppliers${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/suppliers/${id}` as const }),
    CREATE: () => ({ root: "/suppliers" as const }),
    UPDATE: (id: number) => ({ root: `/suppliers/${id}` as const }),
    DELETE: (id: number) => ({ root: `/suppliers/${id}` as const }),
  } as const,

  // Contacts
  CONTACTS: {
    LIST: (limit?: number) => ({
      root: `/contacts${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/contacts/${id}` as const }),
    CREATE: () => ({ root: "/contacts" as const }),
    UPDATE: (id: number) => ({ root: `/contacts/${id}` as const }),
    DELETE: (id: number) => ({ root: `/contacts/${id}` as const }),
  } as const,

  // Shipping
  SHIPPING: {
    LIST: (limit?: number) => ({
      root: `/shipping/${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/shipping/${id}` as const }),
    CREATE: () => ({ root: "/shipping/" as const }),
    UPDATE: (id: number) => ({ root: `/shipping/${id}` as const }),
    DELETE: (id: number) => ({ root: `/shipping/${id}` as const }),
  } as const,

  // Banking
  BANKING: {
    LIST: (limit?: number) => ({
      root: `/banking/${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/banking/${id}` as const }),
    CREATE: () => ({ root: "/banking/" as const }),
    UPDATE: (id: number) => ({ root: `/banking/${id}` as const }),
    DELETE: (id: number) => ({ root: `/banking/${id}` as const }),
  } as const,

  // Samples
  SAMPLES: {
    LIST: (limit?: number) => ({
      root: `/samples${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/samples/${id}` as const }),
    BY_SAMPLE_ID: (sampleId: string) => ({
      root: `/samples/by-sample-id/${sampleId}` as const,
    }),
    CREATE: () => ({ root: "/samples" as const }),
    UPDATE: (id: number) => ({ root: `/samples/${id}` as const }),
    DELETE: (id: number) => ({ root: `/samples/${id}` as const }),
    OPERATIONS: (sampleId: number) => ({
      root: `/samples/operations?sample_id=${sampleId}` as const,
    }),
    CREATE_OPERATION: () => ({ root: "/samples/operations" as const }),
  } as const,

  // Styles
  STYLES: {
    LIST: (limit?: number) => ({
      root: `/samples/styles${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.STYLES}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/samples/styles/${id}` as const }),
    CREATE: () => ({ root: "/samples/styles" as const }),
    UPDATE: (id: number) => ({ root: `/samples/styles/${id}` as const }),
    DELETE: (id: number) => ({ root: `/samples/styles/${id}` as const }),
  } as const,

  // Style Variants
  STYLE_VARIANTS: {
    LIST: (styleSummaryId?: number, limit?: number) => ({
      root: `/samples/style-variants${styleSummaryId ? `?style_summary_id=${styleSummaryId}&` : "?"}limit=${limit || API_LIMITS.STYLE_VARIANTS}` as const,
    }),
    DETAIL: (id: number) => ({
      root: `/samples/style-variants/${id}` as const,
    }),
    CREATE: () => ({ root: "/samples/style-variants" as const }),
    UPDATE: (id: number) => ({
      root: `/samples/style-variants/${id}` as const,
    }),
    DELETE: (id: number) => ({
      root: `/samples/style-variants/${id}` as const,
    }),
  } as const,

  // Required Materials
  REQUIRED_MATERIALS: {
    LIST: (styleVariantId?: number) => ({
      root: `/samples/required-materials${styleVariantId ? `?style_variant_id=${styleVariantId}` : ""}` as const,
    }),
    DETAIL: (id: number) => ({
      root: `/samples/required-materials/${id}` as const,
    }),
    CREATE: () => ({ root: "/samples/required-materials" as const }),
    UPDATE: (id: number) => ({
      root: `/samples/required-materials/${id}` as const,
    }),
    DELETE: (id: number) => ({
      root: `/samples/required-materials/${id}` as const,
    }),
  } as const,

  // Orders
  ORDERS: {
    LIST: (limit?: number) => ({
      root: `/orders${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/orders/${id}` as const }),
    CREATE: () => ({ root: "/orders" as const }),
    UPDATE: (id: number) => ({ root: `/orders/${id}` as const }),
    DELETE: (id: number) => ({ root: `/orders/${id}` as const }),
  } as const,

  // Materials
  MATERIALS: {
    LIST: (limit?: number) => ({
      root: `/materials${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/materials/${id}` as const }),
    CREATE: () => ({ root: "/materials" as const }),
    UPDATE: (id: number) => ({ root: `/materials/${id}` as const }),
    DELETE: (id: number) => ({ root: `/materials/${id}` as const }),
  } as const,

  // Master Data
  MASTER: {
    COLORS: {
      LIST: (category?: string) => ({
        root: `/master/colors${category ? `?category=${category}&` : "?"}is_active=true` as const,
      }),
      DETAIL: (id: number) => ({ root: `/master/colors/${id}` as const }),
      CREATE: () => ({ root: "/master/colors" as const }),
      UPDATE: (id: number) => ({ root: `/master/colors/${id}` as const }),
      DELETE: (id: number) => ({ root: `/master/colors/${id}` as const }),
      SEED_DEFAULTS: () => ({ root: "/master/seed-defaults" as const }),
    } as const,
    SIZES: {
      LIST: (category?: string) => ({
        root: `/master/sizes${category ? `?category=${category}&` : "?"}is_active=true` as const,
      }),
      DETAIL: (id: number) => ({ root: `/master/sizes/${id}` as const }),
      CREATE: () => ({ root: "/master/sizes" as const }),
      UPDATE: (id: number) => ({ root: `/master/sizes/${id}` as const }),
      DELETE: (id: number) => ({ root: `/master/sizes/${id}` as const }),
    } as const,
  } as const,

  // Production
  PRODUCTION: {
    LIST: (limit?: number) => ({
      root: `/production${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/production/${id}` as const }),
    CREATE: () => ({ root: "/production" as const }),
    UPDATE: (id: number) => ({ root: `/production/${id}` as const }),
    DELETE: (id: number) => ({ root: `/production/${id}` as const }),
  } as const,

  // Inventory
  INVENTORY: {
    LIST: (limit?: number) => ({
      root: `/inventory${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/inventory/${id}` as const }),
    CREATE: () => ({ root: "/inventory" as const }),
    UPDATE: (id: number) => ({ root: `/inventory/${id}` as const }),
    DELETE: (id: number) => ({ root: `/inventory/${id}` as const }),
  } as const,

  // Reports
  REPORTS: {
    DASHBOARD: () => ({ root: "/reports/dashboard" as const }),
    EXPORT: (type: string) => ({ root: `/reports/export/${type}` as const }),
  } as const,

  // Merchandiser
  MERCHANDISER: {
    // Yarn
    YARN: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/yarn${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (yarnId: string) => ({ root: `/merchandiser/yarn/${yarnId}` as const }),
      CREATE: () => ({ root: "/merchandiser/yarn" as const }),
      UPDATE: (yarnId: string) => ({ root: `/merchandiser/yarn/${yarnId}` as const }),
      DELETE: (yarnId: string) => ({ root: `/merchandiser/yarn/${yarnId}` as const }),
    } as const,

    // Fabric
    FABRIC: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/fabric${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (fabricId: string) => ({ root: `/merchandiser/fabric/${fabricId}` as const }),
      CREATE: () => ({ root: "/merchandiser/fabric" as const }),
      UPDATE: (fabricId: string) => ({ root: `/merchandiser/fabric/${fabricId}` as const }),
      DELETE: (fabricId: string) => ({ root: `/merchandiser/fabric/${fabricId}` as const }),
    } as const,

    // Trims
    TRIMS: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/trims${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (productId: string) => ({ root: `/merchandiser/trims/${productId}` as const }),
      CREATE: () => ({ root: "/merchandiser/trims" as const }),
      UPDATE: (productId: string) => ({ root: `/merchandiser/trims/${productId}` as const }),
      DELETE: (productId: string) => ({ root: `/merchandiser/trims/${productId}` as const }),
    } as const,

    // Accessories
    ACCESSORIES: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/accessories${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (productId: string) => ({ root: `/merchandiser/accessories/${productId}` as const }),
      CREATE: () => ({ root: "/merchandiser/accessories" as const }),
      UPDATE: (productId: string) => ({ root: `/merchandiser/accessories/${productId}` as const }),
      DELETE: (productId: string) => ({ root: `/merchandiser/accessories/${productId}` as const }),
    } as const,

    // Finished Good
    FINISHED_GOOD: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/finished-good${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (productId: string) => ({ root: `/merchandiser/finished-good/${productId}` as const }),
      CREATE: () => ({ root: "/merchandiser/finished-good" as const }),
      UPDATE: (productId: string) => ({ root: `/merchandiser/finished-good/${productId}` as const }),
      DELETE: (productId: string) => ({ root: `/merchandiser/finished-good/${productId}` as const }),
    } as const,

    // Packing Good
    PACKING_GOOD: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/packing-good${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (productId: string) => ({ root: `/merchandiser/packing-good/${productId}` as const }),
      CREATE: () => ({ root: "/merchandiser/packing-good" as const }),
      UPDATE: (productId: string) => ({ root: `/merchandiser/packing-good/${productId}` as const }),
      DELETE: (productId: string) => ({ root: `/merchandiser/packing-good/${productId}` as const }),
    } as const,

    // Size Chart
    SIZE_CHART: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/size-chart${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (sizeId: string) => ({ root: `/merchandiser/size-chart/${sizeId}` as const }),
      CREATE: () => ({ root: "/merchandiser/size-chart" as const }),
      UPDATE: (sizeId: string) => ({ root: `/merchandiser/size-chart/${sizeId}` as const }),
      DELETE: (sizeId: string) => ({ root: `/merchandiser/size-chart/${sizeId}` as const }),
    } as const,

    // Sample Primary Info
    SAMPLE_PRIMARY: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/sample-primary${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (sampleId: string) => ({ root: `/merchandiser/sample-primary/${sampleId}` as const }),
      CREATE: () => ({ root: "/merchandiser/sample-primary" as const }),
      UPDATE: (sampleId: string) => ({ root: `/merchandiser/sample-primary/${sampleId}` as const }),
      DELETE: (sampleId: string) => ({ root: `/merchandiser/sample-primary/${sampleId}` as const }),
    } as const,

    // Sample TNA
    SAMPLE_TNA: {
      LIST: (sampleId?: string, limit?: number) => ({
        root: `/merchandiser/sample-tna${sampleId ? `?sample_id=${sampleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (id: number) => ({ root: `/merchandiser/sample-tna/${id}` as const }),
      CREATE: () => ({ root: "/merchandiser/sample-tna" as const }),
      UPDATE: (id: number) => ({ root: `/merchandiser/sample-tna/${id}` as const }),
      DELETE: (id: number) => ({ root: `/merchandiser/sample-tna/${id}` as const }),
    } as const,

    // Sample Status
    SAMPLE_STATUS: {
      LIST: (sampleId?: string, limit?: number) => ({
        root: `/merchandiser/sample-status${sampleId ? `?sample_id=${sampleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (id: number) => ({ root: `/merchandiser/sample-status/${id}` as const }),
      CREATE: () => ({ root: "/merchandiser/sample-status" as const }),
      UPDATE: (id: number) => ({ root: `/merchandiser/sample-status/${id}` as const }),
      DELETE: (id: number) => ({ root: `/merchandiser/sample-status/${id}` as const }),
      SYNC: () => ({ root: "/merchandiser/sample-status/sync-from-samples" as const }),
    } as const,

    // Style Creation
    STYLE_CREATION: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/style-creation${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (styleId: string) => ({ root: `/merchandiser/style-creation/${styleId}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-creation" as const }),
      UPDATE: (styleId: string) => ({ root: `/merchandiser/style-creation/${styleId}` as const }),
      DELETE: (styleId: string) => ({ root: `/merchandiser/style-creation/${styleId}` as const }),
    } as const,

    // Style Basic Info
    STYLE_BASIC_INFO: {
      LIST: (limit?: number) => ({
        root: `/merchandiser/style-basic-info${limit ? `?limit=${limit}` : `?limit=${API_LIMITS.DEFAULT}`}` as const,
      }),
      DETAIL: (styleId: string) => ({ root: `/merchandiser/style-basic-info/${styleId}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-basic-info" as const }),
      UPDATE: (styleId: string) => ({ root: `/merchandiser/style-basic-info/${styleId}` as const }),
      DELETE: (styleId: string) => ({ root: `/merchandiser/style-basic-info/${styleId}` as const }),
    } as const,

    // Style Material Link
    STYLE_MATERIAL: {
      LIST: (styleId?: string, limit?: number) => ({
        root: `/merchandiser/style-material-link${styleId ? `?style_id=${styleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (styleMaterialId: string) => ({ root: `/merchandiser/style-material-link/${styleMaterialId}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-material-link" as const }),
      UPDATE: (styleMaterialId: string) => ({ root: `/merchandiser/style-material-link/${styleMaterialId}` as const }),
      DELETE: (styleMaterialId: string) => ({ root: `/merchandiser/style-material-link/${styleMaterialId}` as const }),
    } as const,

    // Style Color
    STYLE_COLOR: {
      LIST: (styleId?: string, limit?: number) => ({
        root: `/merchandiser/style-color${styleId ? `?style_id=${styleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (id: number) => ({ root: `/merchandiser/style-color/${id}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-color" as const }),
      UPDATE: (id: number) => ({ root: `/merchandiser/style-color/${id}` as const }),
      DELETE: (id: number) => ({ root: `/merchandiser/style-color/${id}` as const }),
    } as const,

    // Style Size
    STYLE_SIZE: {
      LIST: (styleId?: string, limit?: number) => ({
        root: `/merchandiser/style-size${styleId ? `?style_id=${styleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (id: number) => ({ root: `/merchandiser/style-size/${id}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-size" as const }),
      UPDATE: (id: number) => ({ root: `/merchandiser/style-size/${id}` as const }),
      DELETE: (id: number) => ({ root: `/merchandiser/style-size/${id}` as const }),
    } as const,

    // Style Variant
    STYLE_VARIANT: {
      LIST: (styleId?: string, limit?: number) => ({
        root: `/merchandiser/style-variant${styleId ? `?style_id=${styleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (styleVariantId: string) => ({ root: `/merchandiser/style-variant/${styleVariantId}` as const }),
      CREATE: () => ({ root: "/merchandiser/style-variant" as const }),
      UPDATE: (styleVariantId: string) => ({ root: `/merchandiser/style-variant/${styleVariantId}` as const }),
      DELETE: (styleVariantId: string) => ({ root: `/merchandiser/style-variant/${styleVariantId}` as const }),
      AUTO_GENERATE: () => ({ root: "/merchandiser/style-variant/auto-generate" as const }),
    } as const,

    // CM Calculation
    CM_CALCULATION: {
      LIST: (styleId?: string, limit?: number) => ({
        root: `/merchandiser/cm-calculation${styleId ? `?style_id=${styleId}&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
      }),
      DETAIL: (cmId: string) => ({ root: `/merchandiser/cm-calculation/${cmId}` as const }),
      CREATE: () => ({ root: "/merchandiser/cm-calculation" as const }),
      UPDATE: (cmId: string) => ({ root: `/merchandiser/cm-calculation/${cmId}` as const }),
      DELETE: (cmId: string) => ({ root: `/merchandiser/cm-calculation/${cmId}` as const }),
    } as const,
  } as const,

  // Notifications
  NOTIFICATIONS: {
    LIST: (unreadOnly?: boolean, limit?: number) => ({
      root: `/notifications${unreadOnly ? `?unread_only=true&` : "?"}limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    UNREAD_COUNT: () => ({ root: "/notifications/unread-count" as const }),
    MARK_READ: (id: number) => ({ root: `/notifications/${id}/read` as const }),
    MARK_ALL_READ: () => ({ root: "/notifications/mark-all-read" as const }),
  } as const,
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type LinksType = typeof LINKS;
export type PathsType = typeof PATHS;
