"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import {
  hasPageReadAccess,
  hasPageWriteAccess,
  getPageFromRoute,
  type DepartmentId
} from "@/lib/permissions";

/**
 * Hook to check page-level permissions for the current page
 * @returns Object with canRead, canWrite, and helper functions
 */
export function usePagePermissions() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Get page info from current route
  const pageInfo = getPageFromRoute(pathname);

  // Check if user is a superuser (full access)
  const isSuperuser = user?.is_superuser ?? false;

  // Check read access
  const canRead = isSuperuser || (pageInfo
    ? hasPageReadAccess(user, pageInfo.departmentId, pageInfo.pageKey)
    : true);

  // Check write access
  const canWrite = isSuperuser || (pageInfo
    ? hasPageWriteAccess(user, pageInfo.departmentId, pageInfo.pageKey)
    : true);

  /**
   * Check if user can access a specific page by department and page key
   */
  const checkPageAccess = (
    departmentId: DepartmentId | string,
    pageKey: string,
    checkWrite: boolean = false
  ): boolean => {
    if (isSuperuser) return true;
    return checkWrite
      ? hasPageWriteAccess(user, departmentId, pageKey)
      : hasPageReadAccess(user, departmentId, pageKey);
  };

  return {
    user,
    isSuperuser,
    canRead,
    canWrite,
    pageInfo,
    checkPageAccess,
  };
}

/**
 * Hook to check permissions for a specific department and page
 * Use this when you need to check permissions for a page other than the current one
 */
export function useSpecificPagePermissions(
  departmentId: DepartmentId | string,
  pageKey: string
) {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser ?? false;

  const canRead = isSuperuser || hasPageReadAccess(user, departmentId, pageKey);
  const canWrite = isSuperuser || hasPageWriteAccess(user, departmentId, pageKey);

  return {
    user,
    isSuperuser,
    canRead,
    canWrite,
  };
}
