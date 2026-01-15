/**
 * TanStack Query Hooks for Southern Apparels ERP
 *
 * Custom hooks that integrate TanStack Query with the existing API services.
 * Uses centralized query keys from query.config.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/query.config";
import {
  buyersService,
  buyerTypesService,
  suppliersService,
  contactsService,
  shippingService,
  bankingService,
  samplesService,
  stylesService,
  styleVariantsService,
  requiredMaterialsService,
  ordersService,
  materialsService,
  colorsService,
  sizesService,
  productionService,
  inventoryService,
  usersService,
  settingsService,
} from "@/services/api";

// ============================================================================
// BUYERS HOOKS
// ============================================================================

export function useBuyers(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUYERS.LIST().key, limit],
    queryFn: () => buyersService.getAll(limit),
  });
}

export function useBuyer(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUYERS.DETAIL(id).key],
    queryFn: () => buyersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBuyer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => buyersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYERS.LIST().key],
      });
    },
  });
}

export function useUpdateBuyer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      buyersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteBuyer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => buyersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYERS.LIST().key],
      });
    },
  });
}

// ============================================================================
// BUYER TYPES HOOKS
// ============================================================================

export function useBuyerTypes(isActive?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUYER_TYPES.LIST().key, isActive],
    queryFn: () => buyerTypesService.getAll(isActive),
  });
}

export function useBuyerType(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.BUYER_TYPES.DETAIL(id).key],
    queryFn: () => buyerTypesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBuyerType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => buyerTypesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYER_TYPES.LIST().key],
      });
    },
  });
}

export function useUpdateBuyerType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      buyerTypesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYER_TYPES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYER_TYPES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteBuyerType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => buyerTypesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BUYER_TYPES.LIST().key],
      });
    },
  });
}

// ============================================================================
// SUPPLIERS HOOKS
// ============================================================================

export function useSuppliers(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS.LIST().key, limit],
    queryFn: () => suppliersService.getAll(limit),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS.DETAIL(id).key],
    queryFn: () => suppliersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => suppliersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SUPPLIERS.LIST().key],
      });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      suppliersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SUPPLIERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SUPPLIERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SUPPLIERS.LIST().key],
      });
    },
  });
}

// ============================================================================
// CONTACTS HOOKS
// ============================================================================

export function useContacts(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACTS.LIST().key, limit],
    queryFn: () => contactsService.getAll(limit),
  });
}

export function useContact(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACTS.DETAIL(id).key],
    queryFn: () => contactsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => contactsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTACTS.LIST().key],
      });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      contactsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTACTS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTACTS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONTACTS.LIST().key],
      });
    },
  });
}

// ============================================================================
// SHIPPING HOOKS
// ============================================================================

export function useShippingAddresses(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SHIPPING.LIST().key, limit],
    queryFn: () => shippingService.getAll(limit),
  });
}

export function useShippingAddress(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SHIPPING.DETAIL(id).key],
    queryFn: () => shippingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateShippingAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => shippingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING.LIST().key],
      });
    },
  });
}

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      shippingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteShippingAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shippingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SHIPPING.LIST().key],
      });
    },
  });
}

// ============================================================================
// BANKING HOOKS
// ============================================================================

export function useBankingDetails(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.BANKING.LIST().key, limit],
    queryFn: () => bankingService.getAll(limit),
  });
}

export function useBankingDetail(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.BANKING.DETAIL(id).key],
    queryFn: () => bankingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBankingDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => bankingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANKING.LIST().key],
      });
    },
  });
}

export function useUpdateBankingDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      bankingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANKING.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANKING.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteBankingDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BANKING.LIST().key],
      });
    },
  });
}

// ============================================================================
// SAMPLES HOOKS
// ============================================================================

export function useSamples(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SAMPLES.LIST().key, limit],
    queryFn: () => samplesService.getAll(limit),
  });
}

export function useSample(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SAMPLES.DETAIL(id).key],
    queryFn: () => samplesService.getById(id),
    enabled: !!id,
  });
}

export function useSampleBySampleId(sampleId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.SAMPLES.BY_SAMPLE_ID(sampleId).key],
    queryFn: () => samplesService.getBySampleId(sampleId),
    enabled: !!sampleId,
  });
}

export function useCreateSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => samplesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAMPLES.LIST().key],
      });
    },
  });
}

export function useUpdateSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      samplesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAMPLES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAMPLES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => samplesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAMPLES.LIST().key],
      });
    },
  });
}

// ============================================================================
// SETTINGS - COLOR HOOKS
// ============================================================================

// Color Families
export function useColorFamilies(token: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.COLOR_FAMILIES.LIST().key],
    queryFn: () => settingsService.colorFamilies.getAll(token!, 10000),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes (reference data changes rarely)
  });
}

export function useCreateColorFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }: { data: any; token: string }) =>
      settingsService.colorFamilies.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_FAMILIES.LIST().key],
      });
    },
  });
}

export function useUpdateColorFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: any; token: string }) =>
      settingsService.colorFamilies.update(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_FAMILIES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_FAMILIES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteColorFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      settingsService.colorFamilies.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_FAMILIES.LIST().key],
      });
    },
  });
}

// Colors
export function useColors(token: string | null, familyId?: number, limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.COLORS.LIST(familyId, limit).key],
    queryFn: () => settingsService.colors.getAll(token!, familyId, limit || 10000),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }: { data: any; token: string }) =>
      settingsService.colors.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLORS.LIST().key],
      });
    },
  });
}

export function useUpdateColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: any; token: string }) =>
      settingsService.colors.update(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLORS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLORS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      settingsService.colors.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLORS.LIST().key],
      });
    },
  });
}

// Color Values
export function useColorValues(token: string | null, limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.COLOR_VALUES.LIST(limit).key],
    queryFn: () => settingsService.colorValues.getAll(token!, limit || 10000),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateColorValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }: { data: any; token: string }) =>
      settingsService.colorValues.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_VALUES.LIST().key],
      });
    },
  });
}

export function useUpdateColorValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: any; token: string }) =>
      settingsService.colorValues.update(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_VALUES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_VALUES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteColorValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      settingsService.colorValues.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_VALUES.LIST().key],
      });
    },
  });
}

// Color Master - with pagination and caching
export function useColorMasters(
  token: string | null,
  codeType?: string,
  limit?: number,
  skip?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS.COLOR_MASTER.LIST(codeType, limit, skip).key],
    queryFn: () => settingsService.colorMaster.getAll(token!, codeType, limit, skip),
    enabled: !!token && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (more dynamic data)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

export function useCreateColorMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }: { data: any; token: string }) =>
      settingsService.colorMaster.create(data, token),
    onSuccess: () => {
      // Invalidate all color master list queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === QUERY_KEYS.SETTINGS.COLOR_MASTER.LIST().key.split("-").slice(0, 3).join("-");
        },
      });
    },
  });
}

export function useUpdateColorMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: any; token: string }) =>
      settingsService.colorMaster.update(id, data, token),
    onSuccess: (_, { id }) => {
      // Invalidate all color master list queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = String(query.queryKey[0] || "");
          return key.startsWith("settings-color-master");
        },
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SETTINGS.COLOR_MASTER.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteColorMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      settingsService.colorMaster.delete(id, token),
    onSuccess: () => {
      // Invalidate all color master list queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = String(query.queryKey[0] || "");
          return key.startsWith("settings-color-master");
        },
      });
    },
  });
}

export function useSampleOperations(sampleId: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SAMPLES.OPERATIONS(sampleId).key],
    queryFn: () => samplesService.getOperations(sampleId),
    enabled: !!sampleId,
  });
}

// ============================================================================
// STYLES HOOKS
// ============================================================================

export function useStyles(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.STYLES.LIST().key, limit],
    queryFn: () => stylesService.getAll(limit),
  });
}

export function useStyle(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.STYLES.DETAIL(id).key],
    queryFn: () => stylesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => stylesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLES.LIST().key],
      });
    },
  });
}

export function useUpdateStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      stylesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stylesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLES.LIST().key],
      });
    },
  });
}

// ============================================================================
// STYLE VARIANTS HOOKS
// ============================================================================

export function useStyleVariants(styleSummaryId?: number, limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.STYLE_VARIANTS.LIST(styleSummaryId).key, limit],
    queryFn: () => styleVariantsService.getAll(styleSummaryId, limit),
  });
}

export function useStyleVariant(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.STYLE_VARIANTS.DETAIL(id).key],
    queryFn: () => styleVariantsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStyleVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => styleVariantsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLE_VARIANTS.LIST().key],
      });
    },
  });
}

export function useUpdateStyleVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      styleVariantsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLE_VARIANTS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLE_VARIANTS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteStyleVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => styleVariantsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STYLE_VARIANTS.LIST().key],
      });
    },
  });
}

// ============================================================================
// REQUIRED MATERIALS HOOKS
// ============================================================================

export function useRequiredMaterials(styleVariantId?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.LIST(styleVariantId).key],
    queryFn: () => requiredMaterialsService.getAll(styleVariantId),
  });
}

export function useRequiredMaterial(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.DETAIL(id).key],
    queryFn: () => requiredMaterialsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRequiredMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      requiredMaterialsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.LIST().key],
      });
    },
  });
}

export function useUpdateRequiredMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      requiredMaterialsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteRequiredMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => requiredMaterialsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.REQUIRED.LIST().key],
      });
    },
  });
}

// ============================================================================
// ORDERS HOOKS
// ============================================================================

export function useOrders(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS.LIST().key, limit],
    queryFn: () => ordersService.getAll(limit),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS.DETAIL(id).key],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      ordersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
    },
  });
}

// ============================================================================
// MATERIALS HOOKS
// ============================================================================

export function useMaterials(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATERIALS.LIST().key, limit],
    queryFn: () => materialsService.getAll(limit),
  });
}

export function useMaterial(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATERIALS.DETAIL(id).key],
    queryFn: () => materialsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => materialsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.LIST().key],
      });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      materialsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => materialsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS.LIST().key],
      });
    },
  });
}

// ============================================================================
// MASTER COLORS HOOKS (for garment colors in master data)
// ============================================================================

export function useMasterColors(category?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MASTER.COLORS.LIST(category).key],
    queryFn: () => colorsService.getAll(category),
  });
}

export function useMasterColor(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MASTER.COLORS.DETAIL(id).key],
    queryFn: () => colorsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => colorsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.COLORS.LIST().key],
      });
    },
  });
}

export function useUpdateMasterColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      colorsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.COLORS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.COLORS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteMasterColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => colorsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.COLORS.LIST().key],
      });
    },
  });
}

// ============================================================================
// SIZES HOOKS
// ============================================================================

export function useSizes(category?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MASTER.SIZES.LIST(category).key],
    queryFn: () => sizesService.getAll(category),
  });
}

export function useSize(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.MASTER.SIZES.DETAIL(id).key],
    queryFn: () => sizesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => sizesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.SIZES.LIST().key],
      });
    },
  });
}

export function useUpdateSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      sizesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.SIZES.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.SIZES.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sizesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MASTER.SIZES.LIST().key],
      });
    },
  });
}

// ============================================================================
// PRODUCTION HOOKS
// ============================================================================

export function useProduction(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTION.LIST().key, limit],
    queryFn: () => productionService.getAll(limit),
  });
}

export function useProductionItem(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTION.DETAIL(id).key],
    queryFn: () => productionService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => productionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTION.LIST().key],
      });
    },
  });
}

export function useUpdateProduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      productionService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTION.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTION.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteProduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCTION.LIST().key],
      });
    },
  });
}

// ============================================================================
// INVENTORY HOOKS
// ============================================================================

export function useInventory(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY.LIST().key, limit],
    queryFn: () => inventoryService.getAll(limit),
  });
}

export function useInventoryItem(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVENTORY.DETAIL(id).key],
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY.LIST().key],
      });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      inventoryService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY.LIST().key],
      });
    },
  });
}

// ============================================================================
// USERS HOOKS (Requires token)
// ============================================================================

export function useUsers(token: string, limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS.LIST().key, limit],
    queryFn: () => usersService.getAll(token, limit),
    enabled: !!token,
  });
}

export function useUser(id: number, token: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS.DETAIL(id).key],
    queryFn: () => usersService.getById(id, token),
    enabled: !!id && !!token,
  });
}

export function useCreateUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof usersService.create>[0]) =>
      usersService.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
    },
  });
}

export function useUpdateUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      usersService.update(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
    },
  });
}
