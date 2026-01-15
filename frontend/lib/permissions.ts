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
  "Order Info": "orders",
  "Orders": "orders",
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
};

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
};

/** All available department IDs as array for iteration */
export const ALL_DEPARTMENT_IDS: DepartmentId[] = Object.values(DEPARTMENTS);

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
