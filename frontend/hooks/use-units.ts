/**
 * Unit Conversion System React Query Hooks
 *
 * Custom hooks for comprehensive unit management with TanStack Query
 * Supports SI, International, Desi, English, and CGS units
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { QUERY_KEYS } from "@/query.config";
import { unitService, settingsService } from "@/services/api";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UnitTypeEnum = "SI" | "International" | "Desi" | "English" | "CGS" | "Other";

export interface UnitCategory {
  id: number;
  name: string;
  description?: string;
  base_unit_name: string;
  base_unit_symbol: string;
  icon?: string;
  industry_use?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UnitCategoryWithCount extends UnitCategory {
  unit_count: number;
  base_unit?: string;
}

export interface UnitCategoryWithUnits extends UnitCategory {
  units: Unit[];
}

export interface Unit {
  id: number;
  category_id: number;
  name: string;
  symbol: string;
  description?: string;
  unit_type: UnitTypeEnum;
  region?: string;
  to_base_factor: number;
  alternate_names?: string;
  is_base: boolean;
  is_active: boolean;
  decimal_places: number;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface UnitWithCategory extends Unit {
  category_name: string;
  base_unit_symbol: string;
}

export interface UnitForSelector {
  id: number;
  name: string;
  symbol: string;
  display_name: string;
  category_id: number;
  category_name: string;
  is_base: boolean;
  unit_type: UnitTypeEnum;
}

export interface ConversionResult {
  value: number;
  from_unit: Unit;
  to_unit: Unit;
  result: number;
  formula: string;
}

export interface ConversionRequest {
  value: number;
  fromUnitId: number;
  toUnitId: number;
}

// ============================================================================
// UNIT CATEGORY HOOKS
// ============================================================================

/**
 * Get all unit categories
 * Configured with 5-minute cache as per task requirements
 */
export function useUnitCategories(isActive?: boolean) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST().key, isActive],
    queryFn: () => unitService.categories.getAll(token!, isActive),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes as per task requirements
  });
}

/**
 * Get all unit categories with unit counts (for dashboard)
 */
export function useUnitCategoriesWithCounts(isActive?: boolean) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key, isActive],
    queryFn: () => unitService.categories.getAllWithCounts(token!, isActive),
    enabled: !!token,
  });
}

/**
 * Get a specific unit category by ID
 */
export function useUnitCategory(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.CATEGORIES.DETAIL(id).key],
    queryFn: () => unitService.categories.getById(id, token!),
    enabled: !!token && !!id,
  });
}

/**
 * Create a new unit category
 */
export function useCreateUnitCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UnitCategory>) =>
      unitService.categories.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Update a unit category
 */
export function useUpdateUnitCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UnitCategory> }) =>
      unitService.categories.update(id, data as Record<string, any>, token!),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.DETAIL(id).key],
      });
    },
  });
}

/**
 * Delete a unit category
 */
export function useDeleteUnitCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unitService.categories.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

// ============================================================================
// UNIT HOOKS
// ============================================================================

/**
 * Get all units, optionally filtered by category or type
 * Configured with 5-minute cache as per task requirements
 */
export function useUnits(categoryId?: number, unitType?: UnitTypeEnum, search?: string, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.LIST(categoryId, unitType).key, search, limit],
    queryFn: () => unitService.getAll(token!, categoryId, unitType, search, limit),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes as per task requirements
  });
}

/**
 * Get a specific unit by ID
 */
export function useUnit(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.DETAIL(id).key],
    queryFn: () => unitService.getById(id, token!),
    enabled: !!token && !!id,
  });
}

/**
 * Get units for selector dropdown (optimized)
 */
export function useUnitsForSelector(categoryId?: number, categoryName?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.FOR_SELECTOR(categoryId, categoryName).key],
    queryFn: () => unitService.getForSelector(token!, categoryId, categoryName),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Search units by name/symbol
 */
export function useSearchUnits(query: string, categoryId?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.SEARCH(query, categoryId).key, limit],
    queryFn: () => unitService.search(query, token!, categoryId, limit),
    enabled: !!token && query.length > 0,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

/**
 * Create a new unit
 */
export function useCreateUnit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Unit>) =>
      unitService.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Update a unit
 */
export function useUpdateUnit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Unit> }) =>
      unitService.update(id, data as Record<string, any>, token!),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.DETAIL(id).key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

/**
 * Delete a unit
 */
export function useDeleteUnit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unitService.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.UNITS.CATEGORIES.LIST_WITH_COUNTS().key],
      });
    },
  });
}

// ============================================================================
// CONVERSION HOOKS
// ============================================================================

/**
 * Get compatible units for conversion (same category)
 */
export function useCompatibleUnits(unitId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS.COMPATIBLE(unitId).key],
    queryFn: () => unitService.getCompatible(unitId, token!),
    enabled: !!token && !!unitId,
  });
}

/**
 * Convert between units
 */
export function useConvertUnits() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { value: number; from_unit_symbol: string; to_unit_symbol: string }) =>
      unitService.convert(data, token!),
  });
}

/**
 * Batch convert multiple values
 */
export function useBatchConvertUnits() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { conversions: Array<{ value: number; from_unit: string; to_unit: string }> }) =>
      unitService.batchConvert(data, token!),
  });
}

// ============================================================================
// VALIDATION HOOKS
// ============================================================================

/**
 * Validate if a unit symbol is unique within a category
 */
export function useValidateUnitSymbol() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { symbol: string; category_id: number; exclude_id?: number }) =>
      unitService.validateSymbol(data, token!),
  });
}

// ============================================================================
// UNIT SEARCH HOOK
// ============================================================================

/**
 * Hook for local unit search and filtering with error handling
 * 
 * Implements local filtering by name, symbol, category without API calls.
 * Uses cached units from useUnits hook for efficient searching.
 * Supports case-insensitive search across multiple fields.
 * Provides error states and loading indicators.
 * 
 * **Validates: Requirements 3.2, 13.4, 14.2**
 */
export function useUnitSearch() {
  const { token } = useAuth();
  
  // Get all units from cache (no API call if cached)
  const { data: allUnits = [], isLoading, error, refetch } = useUnits();
  
  const searchUnits = useCallback((
    searchQuery: string,
    categoryFilter?: string,
    unitTypeFilter?: UnitTypeEnum
  ): UnitWithCategory[] => {
    if (!allUnits.length) {
      return [];
    }
    
    let filteredUnits = allUnits;
    
    // Apply category filter if provided
    if (categoryFilter) {
      filteredUnits = filteredUnits.filter((unit: UnitWithCategory) => 
        unit.category_name?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Apply unit type filter if provided
    if (unitTypeFilter) {
      filteredUnits = filteredUnits.filter((unit: UnitWithCategory) => 
        unit.unit_type === unitTypeFilter
      );
    }
    
    // Apply search query filter (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredUnits = filteredUnits.filter((unit: UnitWithCategory) => {
        const nameMatch = unit.name.toLowerCase().includes(query);
        const symbolMatch = unit.symbol.toLowerCase().includes(query);
        const categoryMatch = unit.category_name?.toLowerCase().includes(query) || false;
        const alternateNamesMatch = unit.alternate_names?.toLowerCase().includes(query) || false;
        
        return nameMatch || symbolMatch || categoryMatch || alternateNamesMatch;
      });
    }
    
    // Sort results by relevance (exact matches first, then partial matches)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredUnits.sort((a: UnitWithCategory, b: UnitWithCategory) => {
        // Exact symbol matches first
        const aSymbolExact = a.symbol.toLowerCase() === query;
        const bSymbolExact = b.symbol.toLowerCase() === query;
        if (aSymbolExact && !bSymbolExact) return -1;
        if (!aSymbolExact && bSymbolExact) return 1;
        
        // Exact name matches second
        const aNameExact = a.name.toLowerCase() === query;
        const bNameExact = b.name.toLowerCase() === query;
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;
        
        // Symbol starts with query
        const aSymbolStarts = a.symbol.toLowerCase().startsWith(query);
        const bSymbolStarts = b.symbol.toLowerCase().startsWith(query);
        if (aSymbolStarts && !bSymbolStarts) return -1;
        if (!aSymbolStarts && bSymbolStarts) return 1;
        
        // Name starts with query
        const aNameStarts = a.name.toLowerCase().startsWith(query);
        const bNameStarts = b.name.toLowerCase().startsWith(query);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;
        
        // Default sort by name
        return a.name.localeCompare(b.name);
      });
    } else {
      // Default sort by category, then by sort_order, then by name
      filteredUnits.sort((a: UnitWithCategory, b: UnitWithCategory) => {
        const categoryCompare = (a.category_name || '').localeCompare(b.category_name || '');
        if (categoryCompare !== 0) return categoryCompare;
        
        const sortOrderCompare = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortOrderCompare !== 0) return sortOrderCompare;
        
        return a.name.localeCompare(b.name);
      });
    }
    
    return filteredUnits;
  }, [allUnits]);
  
  const searchUnitsByCategory = useCallback((
    categoryName: string,
    searchQuery?: string
  ): UnitWithCategory[] => {
    return searchUnits(searchQuery || '', categoryName);
  }, [searchUnits]);
  
  const searchUnitsByType = useCallback((
    unitType: UnitTypeEnum,
    searchQuery?: string
  ): UnitWithCategory[] => {
    return searchUnits(searchQuery || '', undefined, unitType);
  }, [searchUnits]);
  
  const getUnitsByCategory = useCallback((
    categoryName: string
  ): UnitWithCategory[] => {
    if (!allUnits.length) {
      return [];
    }
    
    return allUnits
      .filter((unit: UnitWithCategory) => unit.category_name?.toLowerCase() === categoryName.toLowerCase())
      .sort((a: UnitWithCategory, b: UnitWithCategory) => {
        const sortOrderCompare = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortOrderCompare !== 0) return sortOrderCompare;
        return a.name.localeCompare(b.name);
      });
  }, [allUnits]);
  
  const getUnitsByType = useCallback((
    unitType: UnitTypeEnum
  ): UnitWithCategory[] => {
    if (!allUnits.length) {
      return [];
    }
    
    return allUnits
      .filter((unit: UnitWithCategory) => unit.unit_type === unitType)
      .sort((a: UnitWithCategory, b: UnitWithCategory) => {
        const categoryCompare = (a.category_name || '').localeCompare(b.category_name || '');
        if (categoryCompare !== 0) return categoryCompare;
        
        const sortOrderCompare = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortOrderCompare !== 0) return sortOrderCompare;
        
        return a.name.localeCompare(b.name);
      });
  }, [allUnits]);
  
  const findUnitById = useCallback((
    unitId: number
  ): UnitWithCategory | undefined => {
    return allUnits.find((unit: UnitWithCategory) => unit.id === unitId);
  }, [allUnits]);
  
  const findUnitBySymbol = useCallback((
    symbol: string,
    categoryName?: string
  ): UnitWithCategory | undefined => {
    const units = categoryName 
      ? allUnits.filter((unit: UnitWithCategory) => unit.category_name?.toLowerCase() === categoryName.toLowerCase())
      : allUnits;
    
    return units.find((unit: UnitWithCategory) => 
      unit.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }, [allUnits]);
  
  return {
    // Main search function
    searchUnits,
    
    // Specialized search functions
    searchUnitsByCategory,
    searchUnitsByType,
    
    // Filter functions
    getUnitsByCategory,
    getUnitsByType,
    
    // Lookup functions
    findUnitById,
    findUnitBySymbol,
    
    // State
    allUnits,
    isLoading,
    error,
    refetch,
    
    // Computed properties
    totalUnits: allUnits.length,
    categories: [...new Set(allUnits.map((unit: UnitWithCategory) => unit.category_name).filter(Boolean))].sort(),
    unitTypes: [...new Set(allUnits.map((unit: UnitWithCategory) => unit.unit_type))].sort(),
    
    // Error handling helpers
    hasError: !!error,
    isEmpty: !isLoading && !error && allUnits.length === 0,
  };
}

// ============================================================================
// UNIT CONVERSION HOOK
// ============================================================================

/**
 * Hook for unit conversion with debouncing and comprehensive error handling
 * 
 * Implements convert() function to call POST /api/v1/settings/uom/convert
 * with 300ms debouncing to avoid excessive API calls.
 * Handles loading and error states and stores conversion result in state.
 * Provides detailed error messages for different failure scenarios.
 * 
 * **Validates: Requirements 4.3, 8.1, 13.2, 13.4, 14.3**
 */
export function useUnitConversion() {
  const { token } = useAuth();
  const [isConverting, setIsConverting] = useState(false);
  const [convertedValue, setConvertedValue] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convert = useCallback(({ value, fromUnitId, toUnitId }: ConversionRequest) => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set up debounced conversion (300ms as per requirements)
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsConverting(true);
      setError(null);

      try {
        // Validate inputs before making API call
        if (!value || value <= 0) {
          throw new Error('Invalid value: Value must be greater than 0');
        }
        
        if (!fromUnitId || !toUnitId) {
          throw new Error('Invalid unit_id: Both source and target units must be selected');
        }
        
        if (fromUnitId === toUnitId) {
          throw new Error('Same unit selected: Source and target units cannot be the same');
        }

        // Call the settings UoM conversion endpoint as specified in the design
        const response = await settingsService.uom.convert({
          value,
          from_uom_id: fromUnitId,
          to_uom_id: toUnitId,
        }, token!);

        setConvertedValue(response);
      } catch (err: any) {
        let errorMessage = 'Conversion failed';
        
        // Handle specific error types with user-friendly messages
        if (err.response?.status === 400) {
          const detail = err.response?.data?.detail || '';
          if (detail.includes('incompatible') || detail.includes('different categories')) {
            errorMessage = 'Cannot convert between units in different categories';
          } else if (detail.includes('invalid') || detail.includes('unit_id')) {
            errorMessage = 'Invalid unit selected. Please choose a valid unit.';
          } else {
            errorMessage = detail || 'Invalid conversion request';
          }
        } else if (err.response?.status === 404) {
          errorMessage = 'Unit not found. The selected unit may no longer be available.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Unit conversion service is temporarily unavailable. Please try again.';
        } else if (err.response?.status === 503) {
          errorMessage = 'Unit conversion service is temporarily unavailable. Please try again.';
        } else if (err.message?.includes('Network Error') || err.message?.includes('fetch failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message?.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message?.includes('Invalid unit_id') || err.message?.includes('invalid')) {
          errorMessage = 'Invalid unit selected. Please choose a different unit.';
        } else if (err.message?.includes('Same unit')) {
          errorMessage = 'Source and target units cannot be the same.';
        } else {
          errorMessage = err.message || 'An unexpected error occurred during conversion';
        }
        
        setError(errorMessage);
        setConvertedValue(null);
      } finally {
        setIsConverting(false);
      }
    }, 300); // 300ms debouncing as per task requirements
  }, [token]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cleanup();
    setIsConverting(false);
    setConvertedValue(null);
    setError(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    convert,
    isConverting,
    convertedValue,
    error,
    reset,
    cleanup,
  };
}
