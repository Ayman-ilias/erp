/**
 * Enhanced SizeSelector Component - Task 7.2
 * ===========================================
 * 
 * Enhanced React component with proper enum synchronization supporting:
 * - Size categorization and regional variations
 * - Garment-type-based measurement specifications
 * - Size conversion and equivalents display
 * - Performance optimization and intelligent filtering
 * - Multi-select with measurement preview
 * 
 * Requirements: 1.3, 1.4
 */

"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Check, ChevronsUpDown, X, Ruler, Search, ChevronDown, 
  ChevronRight, Loader2, Filter, Info, RefreshCw, 
  TrendingUp, Users, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type GenderEnum = "Male" | "Female" | "Unisex" | "Kids Boy" | "Kids Girl" | "Kids Unisex" | "Infant" | "Toddler";
export type AgeGroupEnum = "Newborn (0-3 months)" | "Infant (3-12 months)" | "Toddler (1-3 years)" | "Kids (4-12 years)" | "Teen (13-17 years)" | "Adult (18+)" | "All Ages";
export type FitTypeEnum = "Regular" | "Slim" | "Relaxed" | "Oversized" | "Fitted" | "Loose" | "Athletic" | "Tapered";

export interface SizeMeasurement {
  id: number;
  measurement_name: string;
  measurement_code: string;
  value_cm: number;
  value_inch?: number;
  tolerance_plus: number;
  tolerance_minus: number;
  notes?: string;
  display_order: number;
}

export interface GarmentType {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  measurement_specs?: GarmentMeasurementSpec[];
}

export interface GarmentMeasurementSpec {
  id: number;
  measurement_name: string;
  measurement_code: string;
  description?: string;
  unit: string;
  is_required: boolean;
  display_order: number;
  default_tolerance_plus: number;
  default_tolerance_minus: number;
}

export interface EnhancedSelectedSize {
  id: number;
  size_code: string;
  size_name: string;
  size_label?: string;
  garment_type_id: number;
  garment_type_name: string;
  garment_type_category?: string;
  gender: GenderEnum;
  age_group: AgeGroupEnum;
  fit_type: FitTypeEnum;
  age_min_months?: number;
  age_max_months?: number;
  measurements: SizeMeasurement[];
  measurements_summary?: string;
  usage_count?: number;
  popularity_rank?: number;
  regional_variations?: EnhancedSelectedSize[];
}

interface EnhancedSizeSelectorProps {
  selectedSizes: EnhancedSelectedSize[];
  onSizesChange: (sizes: EnhancedSelectedSize[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
  defaultGarmentTypeId?: number;
  showMeasurements?: boolean;
  showRegionalVariations?: boolean;
  enableSizeConversion?: boolean;
}

interface SizeSearchFilters {
  searchTerm: string;
  garmentTypeId?: number;
  gender: GenderEnum | "";
  ageGroup: AgeGroupEnum | "";
  fitType: FitTypeEnum | "";
  category: string;
  showPopularOnly: boolean;
  minUsageCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GENDERS: { value: GenderEnum; label: string; description: string }[] = [
  { value: "Male", label: "Male", description: "Men's sizing" },
  { value: "Female", label: "Female", description: "Women's sizing" },
  { value: "Unisex", label: "Unisex", description: "Unisex sizing" },
  { value: "Kids Boy", label: "Boys", description: "Boys' sizing" },
  { value: "Kids Girl", label: "Girls", description: "Girls' sizing" },
  { value: "Kids Unisex", label: "Kids Unisex", description: "Unisex kids sizing" },
  { value: "Infant", label: "Infant", description: "Infant sizing" },
  { value: "Toddler", label: "Toddler", description: "Toddler sizing" }
];

const AGE_GROUPS: { value: AgeGroupEnum; label: string }[] = [
  { value: "Newborn (0-3 months)", label: "Newborn (0-3m)" },
  { value: "Infant (3-12 months)", label: "Infant (3-12m)" },
  { value: "Toddler (1-3 years)", label: "Toddler (1-3y)" },
  { value: "Kids (4-12 years)", label: "Kids (4-12y)" },
  { value: "Teen (13-17 years)", label: "Teen (13-17y)" },
  { value: "Adult (18+)", label: "Adult (18+)" },
  { value: "All Ages", label: "All Ages" }
];

const FIT_TYPES: { value: FitTypeEnum; label: string; description: string }[] = [
  { value: "Regular", label: "Regular", description: "Standard fit" },
  { value: "Slim", label: "Slim", description: "Fitted cut" },
  { value: "Relaxed", label: "Relaxed", description: "Loose comfortable fit" },
  { value: "Oversized", label: "Oversized", description: "Deliberately large fit" },
  { value: "Fitted", label: "Fitted", description: "Close to body fit" },
  { value: "Loose", label: "Loose", description: "Loose fit" },
  { value: "Athletic", label: "Athletic", description: "Athletic cut" },
  { value: "Tapered", label: "Tapered", description: "Tapered fit" }
];

const GARMENT_CATEGORIES = [
  "Tops", "Bottoms", "Outerwear", "Accessories", "Headwear", 
  "Footwear", "Undergarments", "Activewear", "Sleepwear"
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedSizeSelector({
  selectedSizes,
  onSizesChange,
  maxSelections = 20,
  disabled = false,
  className,
  defaultGarmentTypeId,
  showMeasurements = true,
  showRegionalVariations = true,
  enableSizeConversion = true,
}: EnhancedSizeSelectorProps) {
  const { token } = useAuth();
  
  // Dialog and state management
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search filters state
  const [filters, setFilters] = useState<SizeSearchFilters>({
    searchTerm: "",
    garmentTypeId: defaultGarmentTypeId,
    gender: "",
    ageGroup: "",
    fitType: "",
    category: "",
    showPopularOnly: false,
    minUsageCount: 0
  });

  // Expanded rows for measurement details
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Performance tracking
  const [searchTime, setSearchTime] = useState<number>(0);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Garment types for filtering
  const { data: garmentTypes, isLoading: garmentTypesLoading } = useQuery({
    queryKey: ["garment-types"],
    queryFn: async () => {
      const response = await fetch("/api/v1/sizecolor/garment-types", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Garment types fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Measurement specifications for selected garment type
  const { data: measurementSpecs } = useQuery({
    queryKey: ["garment-measurement-specs", filters.garmentTypeId],
    queryFn: async () => {
      if (!filters.garmentTypeId) return null;
      
      const response = await fetch(`/api/v1/sizecolor/garment-types/${filters.garmentTypeId}/measurements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Measurement specs fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !!filters.garmentTypeId,
    staleTime: 10 * 60 * 1000
  });

  // Enhanced size search with comprehensive filtering
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ["enhanced-size-search", filters, currentPage, pageSize],
    queryFn: async () => {
      const startTime = Date.now();
      
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
        include_measurements: showMeasurements.toString(),
        include_usage_stats: "true"
      });

      // Add filters
      if (filters.searchTerm) params.append("search", filters.searchTerm);
      if (filters.garmentTypeId) params.append("garment_type_id", filters.garmentTypeId.toString());
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.ageGroup) params.append("age_group", filters.ageGroup);
      if (filters.fitType) params.append("fit_type", filters.fitType);
      if (filters.category) params.append("category", filters.category);
      if (filters.minUsageCount > 0) params.append("min_usage_count", filters.minUsageCount.toString());

      const response = await fetch(`/api/v1/sizecolor/sizes/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Size search failed: ${response.statusText}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      setSearchTime(endTime - startTime);
      
      return result.data;
    },
    enabled: !!token && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Popular sizes for quick selection
  const { data: popularSizes } = useQuery({
    queryKey: ["popular-sizes", filters.garmentTypeId, filters.gender],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "10",
        sort_by: "usage_count",
        sort_order: "desc"
      });

      if (filters.garmentTypeId) params.append("garment_type_id", filters.garmentTypeId.toString());
      if (filters.gender) params.append("gender", filters.gender);

      const response = await fetch(`/api/v1/sizecolor/sizes/popular?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Popular sizes fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!token && isOpen,
    staleTime: 10 * 60 * 1000
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSizeSelect = useCallback((size: EnhancedSelectedSize) => {
    const isSelected = selectedSizes.some(s => s.id === size.id);

    if (isSelected) {
      // Remove from selection
      onSizesChange(selectedSizes.filter(s => s.id !== size.id));
    } else {
      // Check max selections
      if (selectedSizes.length >= maxSelections) return;

      // Add to selection
      onSizesChange([...selectedSizes, size]);
    }
  }, [selectedSizes, maxSelections, onSizesChange]);

  const handleSelectAll = useCallback(() => {
    if (!searchResults?.sizes) return;

    const allSelected = searchResults.sizes.every((size: EnhancedSelectedSize) =>
      selectedSizes.some(s => s.id === size.id)
    );

    if (allSelected) {
      // Remove all filtered sizes from selection
      const filteredIds = new Set(searchResults.sizes.map((s: EnhancedSelectedSize) => s.id));
      onSizesChange(selectedSizes.filter(s => !filteredIds.has(s.id)));
    } else {
      // Add all filtered sizes (up to max)
      const currentIds = new Set(selectedSizes.map(s => s.id));
      const newSizes = searchResults.sizes
        .filter((size: EnhancedSelectedSize) => !currentIds.has(size.id))
        .slice(0, maxSelections - selectedSizes.length);
      onSizesChange([...selectedSizes, ...newSizes]);
    }
  }, [searchResults, selectedSizes, maxSelections, onSizesChange]);

  const handleRemoveSize = useCallback((sizeId: number) => {
    onSizesChange(selectedSizes.filter(s => s.id !== sizeId));
  }, [selectedSizes, onSizesChange]);

  const isSizeSelected = useCallback((sizeId: number) => {
    return selectedSizes.some(s => s.id === sizeId);
  }, [selectedSizes]);

  const toggleRowExpand = useCallback((sizeId: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(sizeId)) {
        next.delete(sizeId);
      } else {
        next.add(sizeId);
      }
      return next;
    });
  }, []);

  const handleFilterChange = useCallback((key: keyof SizeSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      garmentTypeId: defaultGarmentTypeId,
      gender: "",
      ageGroup: "",
      fitType: "",
      category: "",
      showPopularOnly: false,
      minUsageCount: 0
    });
    setCurrentPage(1);
  }, [defaultGarmentTypeId]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSizeBadge = (size: EnhancedSelectedSize, showDetails = false) => {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {size.size_name}
        </Badge>
        {size.size_label && (
          <Badge variant="outline" className="text-xs">
            {size.size_label}
          </Badge>
        )}
        {showDetails && (
          <>
            <Badge variant="outline" className="text-xs">
              {size.garment_type_name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {size.gender}
            </Badge>
            {size.usage_count && size.usage_count > 10 && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
          </>
        )}
      </div>
    );
  };

  const renderMeasurementSummary = (measurements: SizeMeasurement[]) => {
    if (!measurements || measurements.length === 0) return "No measurements";
    
    return measurements
      .sort((a, b) => a.display_order - b.display_order)
      .slice(0, 3) // Show first 3 measurements
      .map(m => `${m.measurement_name}: ${m.value_cm}cm`)
      .join(", ");
  };

  const renderMeasurementDetails = (measurements: SizeMeasurement[]) => {
    if (!measurements || measurements.length === 0) {
      return (
        <div className="text-sm text-muted-foreground p-4">
          No measurements recorded for this size
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
        {measurements
          .sort((a, b) => a.display_order - b.display_order)
          .map(measurement => (
            <div
              key={measurement.id}
              className="flex flex-col p-3 rounded-lg border bg-background"
            >
              <div className="font-medium text-sm">{measurement.measurement_name}</div>
              <div className="text-lg font-mono">
                {measurement.value_cm}cm
                {measurement.value_inch && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({measurement.value_inch}")
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                ±{measurement.tolerance_plus}cm / ±{measurement.tolerance_minus}cm
              </div>
              {measurement.notes && (
                <div className="text-xs text-muted-foreground mt-1">
                  {measurement.notes}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  const renderFilterPanel = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Size Filters</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide" : "Show"}
        </Button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">Garment Type</Label>
            <Select
              value={filters.garmentTypeId?.toString() || ""}
              onValueChange={(value) => handleFilterChange("garmentTypeId", value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Garment Types</SelectItem>
                {garmentTypes?.map((type: GarmentType) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name} ({type.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Gender</Label>
            <Select
              value={filters.gender}
              onValueChange={(value) => handleFilterChange("gender", value as GenderEnum | "")}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Genders</SelectItem>
                {GENDERS.map(gender => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Age Group</Label>
            <Select
              value={filters.ageGroup}
              onValueChange={(value) => handleFilterChange("ageGroup", value as AgeGroupEnum | "")}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Ages</SelectItem>
                {AGE_GROUPS.map(age => (
                  <SelectItem key={age.value} value={age.value}>
                    {age.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Fit Type</Label>
            <Select
              value={filters.fitType}
              onValueChange={(value) => handleFilterChange("fitType", value as FitTypeEnum | "")}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All fits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Fits</SelectItem>
                {FIT_TYPES.map(fit => (
                  <SelectItem key={fit.value} value={fit.value}>
                    {fit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {GARMENT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Min Usage Count</Label>
            <Input
              type="number"
              className="h-8"
              value={filters.minUsageCount}
              onChange={(e) => handleFilterChange("minUsageCount", parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="popular-only"
              checked={filters.showPopularOnly}
              onChange={(e) => handleFilterChange("showPopularOnly", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="popular-only" className="text-xs">Popular only</Label>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchSearch()}
          disabled={searchLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", searchLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedGarmentType = garmentTypes?.find((g: GarmentType) => g.id === filters.garmentTypeId);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Sizes Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/30">
        {selectedSizes.length === 0 ? (
          <span className="text-sm text-muted-foreground flex items-center">
            <Ruler className="h-4 w-4 mr-2" />
            No sizes selected
          </span>
        ) : (
          selectedSizes.map((size) => (
            <Badge
              key={size.id}
              variant="secondary"
              className="flex items-center gap-2 pr-1 py-1"
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium">{size.size_name}</span>
                <span className="text-xs text-muted-foreground">
                  {size.garment_type_name}, {size.gender}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => handleRemoveSize(size.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Enhanced Size Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-11"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Select Sizes ({selectedSizes.length}/{maxSelections})
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Enhanced Size Selection
            </DialogTitle>
            <DialogDescription>
              Filter by garment type to see available measurements. Select multiple sizes with detailed specifications.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search sizes by name, code, or measurements..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            {renderFilterPanel()}

            {/* Measurement Specs Info */}
            {selectedGarmentType && measurementSpecs && measurementSpecs.length > 0 && (
              <div className="p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedGarmentType.name} Measurement Specifications
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {measurementSpecs.map((spec: GarmentMeasurementSpec) => (
                        <Badge key={spec.id} variant="outline" className="text-xs">
                          {spec.measurement_name}
                          {spec.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Indicator */}
            {searchTime > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Search completed in {searchTime}ms
                {searchTime > 300 && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Performance Warning
                  </Badge>
                )}
              </div>
            )}

            {/* Popular Sizes Quick Selection */}
            {popularSizes && popularSizes.length > 0 && (
              <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Popular Sizes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSizes.slice(0, 8).map((size: EnhancedSelectedSize) => (
                    <Button
                      key={size.id}
                      variant={isSizeSelected(size.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSizeSelect(size)}
                      disabled={!isSizeSelected(size.id) && selectedSizes.length >= maxSelections}
                      className="h-8"
                    >
                      {size.size_name}
                      {isSizeSelected(size.id) && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Table */}
            <ScrollArea className="flex-1 border rounded-md">
              {searchLoading || garmentTypesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading sizes...</span>
                </div>
              ) : searchError ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <X className="h-8 w-8 mb-2" />
                  <p>Error loading sizes</p>
                  <Button variant="outline" size="sm" onClick={() => refetchSearch()} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : searchResults?.sizes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Ruler className="h-8 w-8 mb-2 opacity-50" />
                  <p>No sizes found with current filters</p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            searchResults?.sizes?.length > 0 &&
                            searchResults.sizes.every((size: EnhancedSelectedSize) =>
                              selectedSizes.some(s => s.id === size.id)
                            )
                          }
                          onCheckedChange={handleSelectAll}
                          disabled={selectedSizes.length >= maxSelections}
                        />
                      </TableHead>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Garment Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age Group</TableHead>
                      <TableHead>Fit Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Measurements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults?.sizes?.map((size: EnhancedSelectedSize) => {
                      const selected = isSizeSelected(size.id);
                      const expanded = expandedRows.has(size.id);

                      return (
                        <React.Fragment key={size.id}>
                          <TableRow
                            className={cn(
                              "cursor-pointer transition-colors",
                              selected && "bg-primary/5"
                            )}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => handleSizeSelect(size)}
                                disabled={!selected && selectedSizes.length >= maxSelections}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRowExpand(size.id)}
                              >
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {renderSizeBadge(size)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{size.garment_type_name}</span>
                                {size.garment_type_category && (
                                  <span className="text-xs text-muted-foreground">
                                    {size.garment_type_category}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {size.gender}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{size.age_group}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {size.fit_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {size.usage_count && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span className="text-xs">{size.usage_count}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {renderMeasurementSummary(size.measurements)}
                            </TableCell>
                          </TableRow>

                          {/* Expanded Measurements Row */}
                          {expanded && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={9} className="py-0">
                                <Collapsible open={expanded}>
                                  <CollapsibleContent>
                                    {renderMeasurementDetails(size.measurements)}
                                  </CollapsibleContent>
                                </Collapsible>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

            {/* Pagination */}
            {searchResults?.metadata && (
              <div className="flex items-center justify-between p-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {searchResults.metadata.total_count} sizes found
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {searchResults.metadata.page_count}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!searchResults.metadata.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {selectedSizes.length} of {maxSelections} sizes selected
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSizesChange([])}
                  disabled={selectedSizes.length === 0}
                >
                  Clear All
                </Button>
                <Button type="button" onClick={() => setIsOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnhancedSizeSelector;