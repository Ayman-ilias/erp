/**
 * Query Configuration for Southern Apparels ERP
 *
 * Centralized query keys for React Query / TanStack Query
 * Used for caching, invalidation, and data fetching patterns
 */

// ============================================================================
// QUERY_KEYS - Centralized Query Key Registry
// ============================================================================

export const QUERY_KEYS = {
  // Authentication
  USER_DETAIL: (token: string) => ({
    key: `user-detail-${token}` as const,
  }),

  // Users
  USERS: {
    LIST: () => ({ key: "users-list" as const }),
    DETAIL: (id: number) => ({ key: `user-detail-${id}` as const }),
  } as const,

  // Buyers
  BUYERS: {
    LIST: () => ({ key: "buyers-list" as const }),
    DETAIL: (id: number) => ({ key: `buyer-detail-${id}` as const }),
  } as const,

  // Buyer Types
  BUYER_TYPES: {
    LIST: () => ({ key: "buyer-types-list" as const }),
    DETAIL: (id: number) => ({ key: `buyer-type-detail-${id}` as const }),
  } as const,

  // Suppliers
  SUPPLIERS: {
    LIST: () => ({ key: "suppliers-list" as const }),
    DETAIL: (id: number) => ({ key: `supplier-detail-${id}` as const }),
  } as const,

  // Contacts
  CONTACTS: {
    LIST: () => ({ key: "contacts-list" as const }),
    DETAIL: (id: number) => ({ key: `contact-detail-${id}` as const }),
  } as const,

  // Shipping
  SHIPPING: {
    LIST: () => ({ key: "shipping-list" as const }),
    DETAIL: (id: number) => ({ key: `shipping-detail-${id}` as const }),
  } as const,

  // Banking
  BANKING: {
    LIST: () => ({ key: "banking-list" as const }),
    DETAIL: (id: number) => ({ key: `banking-detail-${id}` as const }),
  } as const,

  // Samples
  SAMPLES: {
    LIST: () => ({ key: "samples-list" as const }),
    DETAIL: (id: number) => ({ key: `sample-detail-${id}` as const }),
    BY_SAMPLE_ID: (sampleId: string) => ({
      key: `sample-by-id-${sampleId}` as const,
    }),
    OPERATIONS: (sampleId: number) => ({
      key: `sample-operations-${sampleId}` as const,
    }),
  } as const,

  // Styles
  STYLES: {
    LIST: () => ({ key: "styles-list" as const }),
    DETAIL: (id: number) => ({ key: `style-detail-${id}` as const }),
  } as const,

  // Style Variants
  STYLE_VARIANTS: {
    LIST: (styleSummaryId?: number) => ({
      key: styleSummaryId
        ? (`style-variants-${styleSummaryId}` as const)
        : ("style-variants-list" as const),
    }),
    DETAIL: (id: number) => ({ key: `style-variant-detail-${id}` as const }),
  } as const,

  // Materials
  MATERIALS: {
    LIST: () => ({ key: "materials-list" as const }),
    DETAIL: (id: number) => ({ key: `material-detail-${id}` as const }),
    REQUIRED: {
      LIST: (styleVariantId?: number) => ({
        key: styleVariantId
          ? (`required-materials-${styleVariantId}` as const)
          : ("required-materials-list" as const),
      }),
      DETAIL: (id: number) => ({
        key: `required-material-detail-${id}` as const,
      }),
    } as const,
  } as const,

  // Orders
  ORDERS: {
    LIST: () => ({ key: "orders-list" as const }),
    DETAIL: (id: number) => ({ key: `order-detail-${id}` as const }),
  } as const,

  // Production
  PRODUCTION: {
    LIST: () => ({ key: "production-list" as const }),
    DETAIL: (id: number) => ({ key: `production-detail-${id}` as const }),
  } as const,

  // Inventory
  INVENTORY: {
    LIST: () => ({ key: "inventory-list" as const }),
    DETAIL: (id: number) => ({ key: `inventory-detail-${id}` as const }),
  } as const,

  // Master Data
  MASTER: {
    COLORS: {
      LIST: (category?: string) => ({
        key: category ? (`colors-${category}` as const) : ("colors-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `color-detail-${id}` as const }),
    } as const,
    SIZES: {
      LIST: (category?: string) => ({
        key: category ? (`sizes-${category}` as const) : ("sizes-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `size-detail-${id}` as const }),
    } as const,
  } as const,

  // Settings - Colors
  SETTINGS: {
    COLOR_FAMILIES: {
      LIST: () => ({ key: "settings-color-families-list" as const }),
      DETAIL: (id: number) => ({ key: `settings-color-family-${id}` as const }),
    } as const,
    COLORS: {
      LIST: (familyId?: number, limit?: number) => ({
        key: familyId
          ? (`settings-colors-${familyId}-${limit}` as const)
          : limit
          ? (`settings-colors-list-${limit}` as const)
          : ("settings-colors-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `settings-color-${id}` as const }),
    } as const,
    COLOR_VALUES: {
      LIST: (limit?: number) => ({
        key: limit ? (`settings-color-values-${limit}` as const) : ("settings-color-values-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `settings-color-value-${id}` as const }),
    } as const,
    COLOR_MASTER: {
      LIST: (codeType?: string, limit?: number, skip?: number) => ({
        key: codeType
          ? limit
            ? skip !== undefined
              ? (`settings-color-master-${codeType}-${limit}-${skip}` as const)
              : (`settings-color-master-${codeType}-${limit}` as const)
            : (`settings-color-master-${codeType}` as const)
          : limit
          ? skip !== undefined
            ? (`settings-color-master-list-${limit}-${skip}` as const)
            : (`settings-color-master-list-${limit}` as const)
          : ("settings-color-master-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `settings-color-master-${id}` as const }),
    } as const,
    UOM_CATEGORIES: {
      LIST: () => ({ key: "settings-uom-categories-list" as const }),
      LIST_WITH_COUNTS: () => ({ key: "settings-uom-categories-with-counts" as const }),
      DETAIL: (id: number) => ({ key: `settings-uom-category-${id}` as const }),
    } as const,
    UOM: {
      LIST: (categoryId?: number) => ({
        key: categoryId
          ? (`settings-uom-list-category-${categoryId}` as const)
          : ("settings-uom-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `settings-uom-${id}` as const }),
      COMPATIBLE: (uomId: number) => ({ key: `settings-uom-compatible-${uomId}` as const }),
      FOR_SELECTOR: (categoryId?: number, categoryName?: string) => ({
        key: categoryId
          ? (`settings-uom-selector-${categoryId}` as const)
          : categoryName
          ? (`settings-uom-selector-name-${categoryName}` as const)
          : ("settings-uom-selector-all" as const),
      }),
      SEARCH: (query: string, categoryId?: number) => ({
        key: categoryId
          ? (`settings-uom-search-${query}-${categoryId}` as const)
          : (`settings-uom-search-${query}` as const),
      }),
    } as const,
  } as const,

  // Reports
  REPORTS: {
    DASHBOARD: () => ({ key: "reports-dashboard" as const }),
    EXPORT: (type: string) => ({ key: `reports-export-${type}` as const }),
  } as const,
} as const;

// ============================================================================
// Query Key Helpers
// ============================================================================

/**
 * Invalidate all queries for a specific module
 */
export const getModuleQueryKeys = (module: keyof typeof QUERY_KEYS) => {
  return QUERY_KEYS[module];
};

/**
 * Get all list query keys (for bulk invalidation)
 */
export const getAllListKeys = () => [
  QUERY_KEYS.USERS.LIST().key,
  QUERY_KEYS.BUYERS.LIST().key,
  QUERY_KEYS.SUPPLIERS.LIST().key,
  QUERY_KEYS.CONTACTS.LIST().key,
  QUERY_KEYS.SHIPPING.LIST().key,
  QUERY_KEYS.BANKING.LIST().key,
  QUERY_KEYS.SAMPLES.LIST().key,
  QUERY_KEYS.STYLES.LIST().key,
  QUERY_KEYS.STYLE_VARIANTS.LIST().key,
  QUERY_KEYS.MATERIALS.LIST().key,
  QUERY_KEYS.ORDERS.LIST().key,
  QUERY_KEYS.PRODUCTION.LIST().key,
  QUERY_KEYS.INVENTORY.LIST().key,
];

// ============================================================================
// Type Exports
// ============================================================================

export type QueryKeysType = typeof QUERY_KEYS;
