/**
 * Permission checking utilities
 * Uses types from types.d.ts as single source of truth
 */

// Re-export department constants from types.d.ts for convenience
// These are globally available but we re-export for explicit imports
export const DEPARTMENTS = {
  CLIENT_INFO: "client_info",
  SAMPLE_DEPARTMENT: "sample_department",
  MERCHANDISING: "merchandising",
  ORDERS: "orders",
  PRODUCTION: "production",
  INVENTORY: "inventory",
  REPORTS: "reports",
  USER_MANAGEMENT: "user_management",
  BASIC_SETTINGS: "basic_settings",
} as const;

export type DepartmentId = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];

/** Department display names for UI */
export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  client_info: "Client Info",
  sample_department: "Sample Department",
  merchandising: "Merchandising",
  orders: "Orders",
  production: "Production",
  inventory: "Inventory",
  reports: "Reports",
  user_management: "User Management",
  basic_settings: "Basic Settings",
};

/** Menu title to Department ID mapping */
export const MENU_TO_DEPARTMENT: Record<string, DepartmentId> = {
  "Client Info": "client_info",
  "Sample Department": "sample_department",
  "Merchandising": "merchandising",
  "Order Management": "merchandising",  // Order Management is now under Merchandising
  "Production Planning": "production",
  "Store & Inventory": "inventory",
  "Reports": "reports",
  "User Management": "user_management",
  // Merchandising sub-items
  "Material Details": "merchandising",
  "Size Details": "merchandising",
  "Sample Development": "merchandising",
  "Style Management": "merchandising",
  "Style Variants": "merchandising",
  "CM Calculation": "merchandising",
  // Basic Settings sub-items accessible to merchandising
  "Color Master": "merchandising",
  "Size Master": "merchandising",
  "Country Master": "merchandising",
};

/**
 * Settings items accessible to non-admin users based on their department
 * These items appear in Basic Settings but can be accessed by specific departments
 */
export const SETTINGS_ITEMS_BY_DEPARTMENT: Record<DepartmentId, string[]> = {
  merchandising: ["Color Master", "Size Master", "Country Master"],
  client_info: [],
  sample_department: [],
  orders: [],
  production: [],
  inventory: [],
  reports: [],
  user_management: [],
  basic_settings: [],
};

/**
 * Check if a user can access a specific settings item
 * @param user - The user object
 * @param settingsItemTitle - The settings item title (e.g., "Color Master")
 * @returns true if user can access the settings item
 */
export function canAccessSettingsItem(
  user: User | null,
  settingsItemTitle: string
): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Check if any of user's departments allow access to this settings item
  if (user.department_access) {
    for (const deptId of user.department_access) {
      const allowedItems = SETTINGS_ITEMS_BY_DEPARTMENT[deptId as DepartmentId];
      if (allowedItems && allowedItems.includes(settingsItemTitle)) {
        return true;
      }
    }
  }

  return false;
}

/** Route prefix to Department ID mapping */
export const ROUTE_TO_DEPARTMENT: Record<string, DepartmentId> = {
  "/dashboard/erp/clients": "client_info",
  "/dashboard/erp/samples": "sample_department",
  "/dashboard/erp/merchandising": "merchandising",
  "/dashboard/erp/orders": "orders",
  "/dashboard/erp/production": "production",
  "/dashboard/erp/inventory": "inventory",
  "/dashboard/erp/reports": "reports",
  "/dashboard/erp/users": "user_management",
  // Settings pages accessible to merchandising
  "/dashboard/erp/settings/color-master": "merchandising",
  "/dashboard/erp/settings/size-master": "merchandising",
  "/dashboard/erp/settings/countries": "merchandising",
};

/** All available department IDs as array for iteration */
export const ALL_DEPARTMENT_IDS: DepartmentId[] = Object.values(DEPARTMENTS);

/**
 * Page definition for permission management
 */
export interface PageDefinition {
  key: string;       // Unique key for the page
  label: string;     // Display name
  route: string;     // Route path
}

/**
 * Pages available in each department
 * Used for page-level permission management
 */
export const DEPARTMENT_PAGES: Record<DepartmentId, PageDefinition[]> = {
  client_info: [
    { key: "buyer_info", label: "Buyer Info", route: "/dashboard/erp/clients/buyers" },
    { key: "supplier_info", label: "Supplier Info", route: "/dashboard/erp/clients/suppliers" },
    { key: "contact_info", label: "Contact Info", route: "/dashboard/erp/clients/contacts" },
    { key: "shipping_info", label: "Shipping Info", route: "/dashboard/erp/clients/shipping" },
    { key: "banking_info", label: "Banking Info", route: "/dashboard/erp/clients/banking" },
  ],
  sample_department: [
    { key: "sample_request", label: "Sample Request", route: "/dashboard/erp/samples/requests" },
    { key: "sample_plan", label: "Sample Plan", route: "/dashboard/erp/samples/plan" },
    { key: "add_sample_material", label: "Add Sample Material", route: "/dashboard/erp/samples/required-materials" },
    { key: "manufacturing_operations", label: "Add New Manufacturing Operations", route: "/dashboard/erp/samples/manufacturing-operations" },
    { key: "operations_for_sample", label: "Add Operations For Sample", route: "/dashboard/erp/samples/operations" },
    { key: "sample_tna", label: "Sample TNA", route: "/dashboard/erp/samples/tna" },
    { key: "sample_status", label: "Sample Status", route: "/dashboard/erp/samples/status" },
    { key: "variant_materials", label: "Required Material (Style Variant)", route: "/dashboard/erp/samples/variant-materials" },
    { key: "smv_calculation", label: "SMV Calculation", route: "/dashboard/erp/samples/smv" },
  ],
  merchandising: [
    { key: "material_details", label: "Material Details", route: "/dashboard/erp/merchandising/material-details" },
    { key: "sample_development", label: "Sample Development", route: "/dashboard/erp/merchandising/sample-development" },
    { key: "style_management", label: "Style Management", route: "/dashboard/erp/merchandising/style-management" },
    { key: "order_management", label: "Order Management", route: "/dashboard/erp/merchandising/order-management" },
  ],
  orders: [
    { key: "order_list", label: "Order List", route: "/dashboard/erp/orders" },
  ],
  production: [
    { key: "production_planning", label: "Production Planning", route: "/dashboard/erp/production" },
  ],
  inventory: [
    { key: "store_inventory", label: "Store & Inventory", route: "/dashboard/erp/inventory" },
  ],
  reports: [
    { key: "reports_analytics", label: "Reports & Analytics", route: "/dashboard/erp/reports" },
  ],
  user_management: [
    { key: "users", label: "Users", route: "/dashboard/erp/settings/users" },
    { key: "roles", label: "Roles & Permissions", route: "/dashboard/erp/settings/roles" },
  ],
  basic_settings: [
    { key: "company_profile", label: "Company Profile", route: "/dashboard/erp/settings/company-profile" },
    { key: "branches", label: "Branches", route: "/dashboard/erp/settings/branches" },
    { key: "chart_of_accounts", label: "Chart of Accounts", route: "/dashboard/erp/settings/accounts" },
    { key: "currencies", label: "Currencies", route: "/dashboard/erp/settings/currencies" },
    { key: "taxes", label: "Taxes", route: "/dashboard/erp/settings/taxes" },
    { key: "departments", label: "Departments", route: "/dashboard/erp/settings/departments" },
    { key: "unit_conversion", label: "Unit Conversion", route: "/dashboard/erp/settings/unit-conversion" },
    { key: "size_master", label: "Size Master", route: "/dashboard/erp/settings/size-master" },
    { key: "color_master", label: "Color Master", route: "/dashboard/erp/settings/color-master" },
    { key: "warehouses", label: "Warehouses", route: "/dashboard/erp/settings/warehouses" },
    { key: "document_numbering", label: "Document Numbering", route: "/dashboard/erp/settings/document-numbering" },
    { key: "fiscal_year", label: "Fiscal Year", route: "/dashboard/erp/settings/fiscal-year" },
    { key: "country_master", label: "Country Master", route: "/dashboard/erp/settings/countries" },
    { key: "per_minute_value", label: "Per Minute Value", route: "/dashboard/erp/settings/per-minute-value" },
  ],
};

/**
 * Page permission structure
 */
export interface PagePermission {
  read: boolean;
  write: boolean;
}

/**
 * User's page permissions structure
 * { "department_id": { "page_key": { "read": true, "write": false } } }
 */
export type PagePermissions = Record<string, Record<string, PagePermission>>;

/**
 * Check if user has read access to a specific page
 * @param user - The user object
 * @param departmentId - The department ID
 * @param pageKey - The page key
 * @returns true if user has read access
 */
export function hasPageReadAccess(
  user: User | null,
  departmentId: DepartmentId | string,
  pageKey: string
): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Check if user has department access first
  if (!user.department_access?.includes(departmentId)) return false;

  // If no page_permissions defined, fall back to department-level access
  if (!user.page_permissions) return true;

  // Check page-level permission
  const deptPermissions = user.page_permissions[departmentId];
  if (!deptPermissions) return true; // No page restrictions for this dept

  const pagePermission = deptPermissions[pageKey];
  if (!pagePermission) return true; // No restriction for this page

  return pagePermission.read === true;
}

/**
 * Check if user has write access to a specific page
 * @param user - The user object
 * @param departmentId - The department ID
 * @param pageKey - The page key
 * @returns true if user has write access
 */
export function hasPageWriteAccess(
  user: User | null,
  departmentId: DepartmentId | string,
  pageKey: string
): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Check if user has department access first
  if (!user.department_access?.includes(departmentId)) return false;

  // If no page_permissions defined, fall back to department-level access (with write)
  if (!user.page_permissions) return true;

  // Check page-level permission
  const deptPermissions = user.page_permissions[departmentId];
  if (!deptPermissions) return true; // No page restrictions for this dept

  const pagePermission = deptPermissions[pageKey];
  if (!pagePermission) return true; // No restriction for this page

  return pagePermission.write === true;
}

/**
 * Check page access by route path
 * @param user - The user object
 * @param path - The route path
 * @param checkWrite - If true, checks write access; otherwise checks read access
 * @returns true if user has access
 */
export function hasPageAccessByRoute(
  user: User | null,
  path: string,
  checkWrite: boolean = false
): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Find the department and page for this route
  for (const [deptId, pages] of Object.entries(DEPARTMENT_PAGES)) {
    for (const page of pages) {
      if (path.startsWith(page.route)) {
        return checkWrite
          ? hasPageWriteAccess(user, deptId, page.key)
          : hasPageReadAccess(user, deptId, page.key);
      }
    }
  }

  // Route not found in page definitions, fall back to department access
  return canAccessRoute(user, path);
}

/**
 * Get page key from route path
 * @param path - The route path
 * @returns The page key and department ID, or undefined if not found
 */
export function getPageFromRoute(path: string): { departmentId: DepartmentId; pageKey: string } | undefined {
  for (const [deptId, pages] of Object.entries(DEPARTMENT_PAGES)) {
    for (const page of pages) {
      if (path.startsWith(page.route)) {
        return { departmentId: deptId as DepartmentId, pageKey: page.key };
      }
    }
  }
  return undefined;
}

/**
 * Check if user has access to a department
 * @param user - The user object (uses global User type from types.d.ts)
 * @param departmentId - The department ID to check
 * @returns true if user has access, false otherwise
 */
export function hasDepartmentAccess(
  user: User | null,
  departmentId: DepartmentId | string
): boolean {
  if (!user) return false;

  // Superusers have access to everything
  if (user.is_superuser) return true;

  // User management is always admin only
  if (departmentId === DEPARTMENTS.USER_MANAGEMENT) {
    return user.is_superuser;
  }

  // Check if user has this department in their access list
  return user.department_access?.includes(departmentId) || false;
}

/**
 * Check if user can access a route based on department permissions
 * @param user - The user object
 * @param path - The route path to check
 * @returns true if user can access the route, false otherwise
 */
export function canAccessRoute(user: User | null, path: string): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Check if path starts with any protected route
  for (const [route, deptId] of Object.entries(ROUTE_TO_DEPARTMENT)) {
    if (path.startsWith(route)) {
      return hasDepartmentAccess(user, deptId);
    }
  }

  // Default: allow access (for non-protected routes like dashboard home)
  return true;
}

/**
 * Get department ID from menu title
 * @param menuTitle - The menu item title
 * @returns The department ID or undefined if not found
 */
export function getDepartmentFromMenu(menuTitle: string): DepartmentId | undefined {
  return MENU_TO_DEPARTMENT[menuTitle];
}

/**
 * Get department ID from route path
 * @param path - The route path
 * @returns The department ID or undefined if not found
 */
export function getDepartmentFromRoute(path: string): DepartmentId | undefined {
  for (const [route, deptId] of Object.entries(ROUTE_TO_DEPARTMENT)) {
    if (path.startsWith(route)) {
      return deptId;
    }
  }
  return undefined;
}

/**
 * Get all departments a user has access to
 * @param user - The user object
 * @returns Array of department IDs the user can access
 */
export function getUserDepartments(user: User | null): DepartmentId[] {
  if (!user) return [];

  // Superusers have access to all departments
  if (user.is_superuser) return ALL_DEPARTMENT_IDS;

  // Filter departments based on user's access list
  return ALL_DEPARTMENT_IDS.filter(
    (deptId) =>
      deptId !== DEPARTMENTS.USER_MANAGEMENT &&
      user.department_access?.includes(deptId)
  );
}

/**
 * Check if a menu item should be visible to the user
 * @param user - The user object
 * @param menuTitle - The menu item title
 * @param isAdminOnly - Whether the menu item is admin only
 * @returns true if the menu item should be visible
 */
export function isMenuItemVisible(
  user: User | null,
  menuTitle: string,
  isAdminOnly?: boolean
): boolean {
  if (!user) return false;

  // Admin-only items are only visible to superusers
  if (isAdminOnly) return user.is_superuser;

  // Check department access
  const deptId = getDepartmentFromMenu(menuTitle);
  if (deptId) {
    return hasDepartmentAccess(user, deptId);
  }

  // Items without department mapping are visible to all authenticated users
  return true;
}
