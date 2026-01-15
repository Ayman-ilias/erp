/**
 * UOM (Unit of Measure) React Query Hooks
 *
 * Custom hooks for UOM management with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/query.config";
import { settingsService } from "@/services/api";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// UOM CATEGORY HOOKS
// ============================================================================

/**
 * Get all UOM categories
 */
export function useUoMCategories(limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST().key, limit],
    queryFn: () => settingsService.uomCategories.getAll(token!, limit),
    enabled: !!token,
  });
}

/**
 * Get all UOM categories with unit counts (for dashboard)
 */
export function useUoMCategoriesWithCounts(isActive?: boolean) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key, isActive],
    queryFn: () => settingsService.uomCategories.getAllWithCounts(token!, isActive),
    enabled: !!token,
  });
}

/**
 * Get a specific UOM category by ID
 */
export function useUoMCategory(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.DETAIL(id).key],
    queryFn: () => settingsService.uomCategories.getById(id, token!),
    enabled: !!token && !!id,
  });
}

/**
 * Create a new UOM category
 */
export function useCreateUoMCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      settingsService.uomCategories.create(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Update a UOM category
 */
export function useUpdateUoMCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      settingsService.uomCategories.update(id, data, token!),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.DETAIL(id).key],
      });
    },
  });
}

/**
 * Delete a UOM category
 */
export function useDeleteUoMCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => settingsService.uomCategories.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

// ============================================================================
// UOM UNIT HOOKS
// ============================================================================

/**
 * Get all UOM units, optionally filtered by category
 */
export function useUoMs(categoryId?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM.LIST(categoryId).key, limit],
    queryFn: () => settingsService.uom.getAll(token!, categoryId, limit),
    enabled: !!token,
  });
}

/**
 * Get a specific UOM by ID
 */
export function useUoM(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM.DETAIL(id).key],
    queryFn: () => settingsService.uom.getById(id, token!),
    enabled: !!token && !!id,
  });
}

/**
 * Create a new UOM
 */
export function useCreateUoM() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      settingsService.uom.create(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Update a UOM
 */
export function useUpdateUoM() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      settingsService.uom.update(id, data, token!),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM.DETAIL(id).key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Delete a UOM
 */
export function useDeleteUoM() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => settingsService.uom.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.UOM_CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

// ============================================================================
// UOM CONVERSION HOOKS
// ============================================================================

/**
 * Get compatible UOMs for conversion (same category)
 */
export function useCompatibleUoMs(uomId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM.COMPATIBLE(uomId).key],
    queryFn: () => settingsService.uom.getCompatible(uomId, token!),
    enabled: !!token && !!uomId,
  });
}

/**
 * Convert between UOMs
 */
export function useConvertUoM() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { from_uom_id: number; to_uom_id: number; value: number }) =>
      settingsService.uom.convert(data, token!),
  });
}

// ============================================================================
// UOM VALIDATION HOOKS
// ============================================================================

/**
 * Validate if a UOM symbol is unique within a category
 */
export function useValidateUoMSymbol() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { symbol: string; category_id: number; exclude_id?: number }) =>
      settingsService.uom.validateSymbol(data, token!),
  });
}

// ============================================================================
// UOM SELECTOR HOOKS
// ============================================================================

/**
 * Get UOMs for selector dropdown (optimized)
 */
export function useUoMsForSelector(categoryId?: number, categoryName?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM.FOR_SELECTOR(categoryId, categoryName).key],
    queryFn: () => settingsService.uom.getForSelector(token!, categoryId, categoryName),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Search UOMs by name/symbol
 */
export function useSearchUoMs(query: string, categoryId?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.UOM.SEARCH(query, categoryId).key, limit],
    queryFn: () => settingsService.uom.search(query, token!, categoryId, limit),
    enabled: !!token && query.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UoMCategory {
  id: number;
  uom_category: string;
  uom_id?: string;
  uom_name: string;
  uom_description?: string;
  icon?: string;
  industry_use?: string;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UoMCategoryWithUnits extends UoMCategory {
  unit_count: number;
  base_unit?: string;
}

export interface UoM {
  id: number;
  category_id: number;
  name: string;
  symbol: string;
  factor: number;
  is_base: boolean;
  is_active: boolean;
  remarks?: string;
  display_name?: string;
  is_si_unit?: boolean;
  common_usage?: string;
  decimal_places?: number;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface UoMForSelector {
  id: number;
  name: string;
  symbol: string;
  display_name?: string;
  category_id: number;
  category_name?: string;
  is_base: boolean;
}

export interface UoMConversionResult {
  from_uom: string;
  to_uom: string;
  from_value: number;
  to_value: number;
  conversion_factor: number;
  formula?: string;
}
