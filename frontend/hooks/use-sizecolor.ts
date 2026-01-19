/**
 * Size & Color Master System React Query Hooks (Redesigned Schema)
 *
 * Two separate color systems:
 * - Universal Colors: Pantone/TCX/RGB/Hex codes for industry standards
 * - H&M Colors: H&M proprietary 5-digit codes (XX-XXX format)
 *
 * Size system with garment-type-based measurement specifications
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/query.config";
import { sizeColorService } from "@/services/api";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// TYPE DEFINITIONS - ENUMS
// ============================================================================

export type ColorFamilyEnum =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Green"
  | "Blue"
  | "Purple"
  | "Pink"
  | "Brown"
  | "Grey"
  | "Black"
  | "White"
  | "Beige"
  | "Navy"
  | "Cream"
  | "Burgundy"
  | "Teal"
  | "Olive"
  | "Coral"
  | "Multi";

export type ColorTypeEnum =
  | "Solid"
  | "Melange"
  | "Dope Dyed"
  | "Yarn Dyed"
  | "Garment Dyed"
  | "Reactive Dyed"
  | "Pigment Dyed"
  | "Tie Dye"
  | "Ombre"
  | "Print"
  | "Stripe";

export type ColorValueEnum =
  | "Light"
  | "Medium"
  | "Dark"
  | "Bright"
  | "Dusty"
  | "Medium Dusty"
  | "Pastel"
  | "Neon"
  | "Muted";

export type FinishTypeEnum =
  | "Yarn Dyed"
  | "Dope Dyed"
  | "Garment Dyed"
  | "Piece Dyed"
  | "Raw"
  | "Washed"
  | "Enzyme Washed"
  | "Stone Washed";

export type GenderEnum = "Male" | "Female" | "Unisex" | "Kids Boy" | "Kids Girl" | "Kids Unisex" | "Infant" | "Toddler";

export type FitTypeEnum =
  | "Regular"
  | "Slim"
  | "Relaxed"
  | "Oversized"
  | "Fitted"
  | "Loose"
  | "Athletic"
  | "Tapered";

export type AgeGroupEnum =
  | "Newborn (0-3 months)"
  | "Infant (3-12 months)"
  | "Toddler (1-3 years)"
  | "Kids (4-12 years)"
  | "Teen (13-17 years)"
  | "Adult (18+)"
  | "All Ages";

// ============================================================================
// TYPE DEFINITIONS - UNIVERSAL COLORS
// ============================================================================

export interface UniversalColor {
  id: number;
  color_name: string;
  display_name?: string;
  color_code: string;
  hex_code: string;
  rgb_r?: number;
  rgb_g?: number;
  rgb_b?: number;
  pantone_code?: string;
  tcx_code?: string;
  tpx_code?: string;
  color_family?: ColorFamilyEnum;
  color_type?: ColorTypeEnum;
  color_value?: ColorValueEnum;
  finish_type?: FinishTypeEnum;
  description?: string;
  season?: string;
  year?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UniversalColorForSelector {
  id: number;
  color_name: string;
  color_code: string;
  hex_code: string;
  pantone_code?: string;
  tcx_code?: string;
  color_family?: ColorFamilyEnum;
  label: string;
}

// ============================================================================
// TYPE DEFINITIONS - H&M COLORS
// ============================================================================

export interface HMColorGroup {
  id: number;
  group_code: string;
  group_name: string;
  description?: string;
  is_active: boolean;
  colors?: HMColor[];
}

export interface HMColor {
  id: number;
  hm_code: string;
  hm_name: string;
  group_id: number;
  universal_color_id?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  group?: HMColorGroup;
  universal_color?: UniversalColor;
}

export interface HMColorForSelector {
  id: number;
  hm_code: string;
  hm_name: string;
  group_name?: string;
  hex_code?: string;
  label: string;
}

// ============================================================================
// TYPE DEFINITIONS - GARMENT TYPES & MEASUREMENTS
// ============================================================================

export interface GarmentType {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  is_active: boolean;
  measurement_specs?: GarmentMeasurementSpec[];
}

export interface GarmentMeasurementSpec {
  id: number;
  garment_type_id: number;
  measurement_name: string;
  measurement_code: string;
  display_order: number;
  is_required: boolean;
  description?: string;
}

export interface GarmentTypeForSelector {
  id: number;
  name: string;
  code: string;
  category?: string;
  label: string;
}

// ============================================================================
// TYPE DEFINITIONS - SIZES
// ============================================================================

export interface SizeMaster {
  id: number;
  garment_type_id: number;
  size_code: string;
  size_name: string;
  size_label?: string;
  gender: GenderEnum;
  age_group: AgeGroupEnum;
  fit_type?: FitTypeEnum;
  size_order: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  garment_type?: GarmentType;
  measurements?: SizeMeasurement[];
}

export interface SizeMeasurement {
  id: number;
  size_id: number;
  measurement_spec_id: number;
  value_cm: number;
  value_inch?: number;
  tolerance_plus?: number;
  tolerance_minus?: number;
  notes?: string;
  measurement_spec?: GarmentMeasurementSpec;
}

export interface SizeForSelector {
  id: number;
  size_code: string;
  size_name: string;
  size_label?: string;
  garment_type_id: number;
  garment_type_name: string;
  gender: string;
  age_group: string;
  fit_type: string;
  label: string;
  measurements_summary?: string;
}

// ============================================================================
// TYPE DEFINITIONS - SAMPLE SELECTIONS
// ============================================================================

export interface SampleColorSelection {
  id: number;
  sample_id: number;
  color_type: "universal" | "hm";
  universal_color_id?: number;
  hm_color_id?: number;
  notes?: string;
  universal_color?: UniversalColor;
  hm_color?: HMColor;
}

export interface SampleSizeSelection {
  id: number;
  sample_id: number;
  size_id: number;
  quantity?: number;
  notes?: string;
  size?: SizeMaster;
}

// ============================================================================
// UNIVERSAL COLOR HOOKS
// ============================================================================

export function useUniversalColors(colorFamily?: string, colorType?: string, skip?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "universal-colors", colorFamily, colorType, skip, limit],
    queryFn: () => sizeColorService.universalColors.getAll(token!, colorFamily, colorType, skip, limit),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUniversalColorsForSelector(colorFamily?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "universal-colors", "for-selector", colorFamily],
    queryFn: () => sizeColorService.universalColors.getForSelector(token!, colorFamily),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUniversalColor(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "universal-colors", id],
    queryFn: () => sizeColorService.universalColors.getById(id, token!),
    enabled: !!token && !!id,
  });
}

export function useUniversalColorByCode(code: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "universal-colors", "by-code", code],
    queryFn: () => sizeColorService.universalColors.getByCode(code, token!),
    enabled: !!token && !!code,
  });
}

export function useCreateUniversalColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UniversalColor>) =>
      sizeColorService.universalColors.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "universal-colors"] });
    },
  });
}

export function useUpdateUniversalColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UniversalColor> }) =>
      sizeColorService.universalColors.update(id, data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "universal-colors"] });
    },
  });
}

export function useDeleteUniversalColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sizeColorService.universalColors.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "universal-colors"] });
    },
  });
}

// ============================================================================
// H&M COLOR HOOKS
// ============================================================================

export function useHMColorGroups() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "hm-colors", "groups"],
    queryFn: () => sizeColorService.hmColors.getGroups(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useCreateHMColorGroup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HMColorGroup>) =>
      sizeColorService.hmColors.createGroup(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "hm-colors", "groups"] });
    },
  });
}

export function useHMColors(groupId?: number, skip?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "hm-colors", groupId, skip, limit],
    queryFn: () => sizeColorService.hmColors.getAll(token!, groupId, skip, limit),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHMColorsForSelector(groupId?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "hm-colors", "for-selector", groupId],
    queryFn: () => sizeColorService.hmColors.getForSelector(token!, groupId),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHMColor(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "hm-colors", id],
    queryFn: () => sizeColorService.hmColors.getById(id, token!),
    enabled: !!token && !!id,
  });
}

export function useHMColorByCode(hmCode: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "hm-colors", "by-code", hmCode],
    queryFn: () => sizeColorService.hmColors.getByCode(hmCode, token!),
    enabled: !!token && !!hmCode,
  });
}

export function useCreateHMColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HMColor>) =>
      sizeColorService.hmColors.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "hm-colors"] });
    },
  });
}

export function useUpdateHMColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HMColor> }) =>
      sizeColorService.hmColors.update(id, data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "hm-colors"] });
    },
  });
}

export function useDeleteHMColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sizeColorService.hmColors.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "hm-colors"] });
    },
  });
}

// ============================================================================
// GARMENT TYPE HOOKS
// ============================================================================

export function useGarmentTypes(skip?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "garment-types", skip, limit],
    queryFn: () => sizeColorService.garmentTypes.getAll(token!, skip, limit),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGarmentTypesForSelector() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "garment-types", "for-selector"],
    queryFn: () => sizeColorService.garmentTypes.getForSelector(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGarmentType(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "garment-types", id],
    queryFn: () => sizeColorService.garmentTypes.getById(id, token!),
    enabled: !!token && !!id,
  });
}

export function useGarmentTypeMeasurements(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "garment-types", id, "measurements"],
    queryFn: () => sizeColorService.garmentTypes.getMeasurements(id, token!),
    enabled: !!token && !!id,
  });
}

export function useCreateGarmentType() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GarmentType>) =>
      sizeColorService.garmentTypes.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "garment-types"] });
    },
  });
}

export function useUpdateGarmentType() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GarmentType> }) =>
      sizeColorService.garmentTypes.update(id, data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "garment-types"] });
    },
  });
}

export function useAddGarmentTypeMeasurement() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GarmentMeasurementSpec> }) =>
      sizeColorService.garmentTypes.addMeasurement(id, data as Record<string, any>, token!),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "garment-types", id] });
    },
  });
}

// ============================================================================
// SIZE HOOKS
// ============================================================================

export function useSizes(garmentTypeId?: number, gender?: string, ageGroup?: string, fitType?: string, skip?: number, limit?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "sizes", garmentTypeId, gender, ageGroup, fitType, skip, limit],
    queryFn: () => sizeColorService.sizes.getAll(token!, garmentTypeId, gender, ageGroup, fitType, skip, limit),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSizesForSelector(garmentTypeId?: number, gender?: string, ageGroup?: string, fitType?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "sizes", "for-selector", garmentTypeId, gender, ageGroup, fitType],
    queryFn: () => sizeColorService.sizes.getForSelector(token!, garmentTypeId, gender, ageGroup, fitType),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSize(id: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "sizes", id],
    queryFn: () => sizeColorService.sizes.getById(id, token!),
    enabled: !!token && !!id,
  });
}

export function useCreateSize() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SizeMaster>) =>
      sizeColorService.sizes.create(data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes"] });
    },
  });
}

export function useUpdateSize() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SizeMaster> }) =>
      sizeColorService.sizes.update(id, data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes"] });
    },
  });
}

export function useDeleteSize() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sizeColorService.sizes.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes"] });
    },
  });
}

export function useAddSizeMeasurement() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sizeId, data }: { sizeId: number; data: Partial<SizeMeasurement> }) =>
      sizeColorService.sizes.addMeasurement(sizeId, data as Record<string, any>, token!),
    onSuccess: (_, { sizeId }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes", sizeId] });
    },
  });
}

// ============================================================================
// MEASUREMENT HOOKS
// ============================================================================

export function useUpdateMeasurement() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SizeMeasurement> }) =>
      sizeColorService.measurements.update(id, data as Record<string, any>, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes"] });
    },
  });
}

export function useDeleteMeasurement() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sizeColorService.measurements.delete(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sizes"] });
    },
  });
}

// ============================================================================
// SAMPLE COLOR SELECTION HOOKS
// ============================================================================

export function useSampleColors(sampleId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "sample-colors", sampleId],
    queryFn: () => sizeColorService.sampleColors.get(sampleId, token!),
    enabled: !!token && !!sampleId,
  });
}

export function useAddSampleColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sampleId, data }: { sampleId: number; data: Partial<SampleColorSelection> }) =>
      sizeColorService.sampleColors.add(sampleId, data as Record<string, any>, token!),
    onSuccess: (_, { sampleId }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sample-colors", sampleId] });
    },
  });
}

export function useDeleteSampleColor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectionId: number) => sizeColorService.sampleColors.delete(selectionId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sample-colors"] });
    },
  });
}

// ============================================================================
// SAMPLE SIZE SELECTION HOOKS
// ============================================================================

export function useSampleSizes(sampleId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "sample-sizes", sampleId],
    queryFn: () => sizeColorService.sampleSizes.get(sampleId, token!),
    enabled: !!token && !!sampleId,
  });
}

export function useAddSampleSize() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sampleId, data }: { sampleId: number; data: Partial<SampleSizeSelection> }) =>
      sizeColorService.sampleSizes.add(sampleId, data as Record<string, any>, token!),
    onSuccess: (_, { sampleId }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sample-sizes", sampleId] });
    },
  });
}

export function useDeleteSampleSize() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectionId: number) => sizeColorService.sampleSizes.delete(selectionId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "sample-sizes"] });
    },
  });
}

// ============================================================================
// SUGGESTION HOOKS
// ============================================================================

export function useBuyerSuggestions(buyerId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "suggestions", buyerId],
    queryFn: () => sizeColorService.getSuggestions(buyerId, token!),
    enabled: !!token && !!buyerId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// USAGE TRACKING HOOKS
// ============================================================================

export function useRecordColorUsage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { buyer_id: number; universal_color_id?: number; hm_color_id?: number }) =>
      sizeColorService.usage.recordColor(data, token!),
    onSuccess: (_, { buyer_id }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "suggestions", buyer_id] });
    },
  });
}

export function useRecordSizeUsage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { buyer_id: number; size_id: number }) =>
      sizeColorService.usage.recordSize(data, token!),
    onSuccess: (_, { buyer_id }) => {
      queryClient.invalidateQueries({ queryKey: ["sizecolor", "suggestions", buyer_id] });
    },
  });
}

// ============================================================================
// OPTIONS HOOKS (ENUMS)
// ============================================================================

export function useColorFamilies() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "color-families"],
    queryFn: () => sizeColorService.options.getColorFamilies(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useColorTypes() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "color-types"],
    queryFn: () => sizeColorService.options.getColorTypes(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useColorValues() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "color-values"],
    queryFn: () => sizeColorService.options.getColorValues(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useFinishTypes() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "finish-types"],
    queryFn: () => sizeColorService.options.getFinishTypes(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useGenders() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "genders"],
    queryFn: () => sizeColorService.options.getGenders(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useFitTypes() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "fit-types"],
    queryFn: () => sizeColorService.options.getFitTypes(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}

export function useAgeGroups() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sizecolor", "options", "age-groups"],
    queryFn: () => sizeColorService.options.getAgeGroups(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });
}
