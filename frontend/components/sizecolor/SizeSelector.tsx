/**
 * SizeSelector Component for Sample Development Form
 *
 * Features:
 * - Filter by garment type (auto-loads measurement specs)
 * - Filter by gender, age group, fit type
 * - Multi-select sizes with measurement preview
 * - Expandable rows showing full measurements
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import {
  Check,
  ChevronsUpDown,
  X,
  Ruler,
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  Filter,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSizesForSelector,
  useGarmentTypesForSelector,
  useGarmentTypeMeasurements,
  type SizeForSelector,
  type GarmentTypeForSelector,
  type GenderEnum,
  type AgeGroupEnum,
  type FitTypeEnum,
} from "@/hooks/use-sizecolor";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SelectedSize {
  id: number;
  size_code: string;
  size_name: string;
  size_label?: string;
  garment_type_name: string;
  gender: string;
  age_group: string;
  fit_type?: string;
  measurements_summary?: string;
}

interface SizeSelectorProps {
  selectedSizes: SelectedSize[];
  onSizesChange: (sizes: SelectedSize[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
  defaultGarmentTypeId?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GENDERS: GenderEnum[] = ["Male", "Female", "Unisex", "Kids Boy", "Kids Girl", "Kids Unisex", "Infant", "Toddler"];
const AGE_GROUPS: AgeGroupEnum[] = ["Newborn (0-3 months)", "Infant (3-12 months)", "Toddler (1-3 years)", "Kids (4-12 years)", "Teen (13-17 years)", "Adult (18+)", "All Ages"];
const FIT_TYPES: FitTypeEnum[] = ["Regular", "Slim", "Relaxed", "Oversized", "Fitted", "Loose", "Athletic", "Tapered"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SizeSelector({
  selectedSizes,
  onSizesChange,
  maxSelections = 20,
  disabled = false,
  className,
  defaultGarmentTypeId,
}: SizeSelectorProps) {
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);

  // Filter states
  const [garmentTypeId, setGarmentTypeId] = useState<number | undefined>(defaultGarmentTypeId);
  const [gender, setGender] = useState<GenderEnum | "">("");
  const [ageGroup, setAgeGroup] = useState<AgeGroupEnum | "">("");
  const [fitType, setFitType] = useState<FitTypeEnum | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded rows for measurement details
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Fetch data using hooks with error handling
  const { data: garmentTypes, isLoading: garmentTypesLoading, error: garmentTypesError } = useGarmentTypesForSelector();
  const { data: sizes, isLoading: sizesLoading, error: sizesError } = useSizesForSelector(
    garmentTypeId,
    gender || undefined,
    ageGroup || undefined,
    fitType || undefined
  );
  const { data: measurementSpecs, error: measurementSpecsError } = useGarmentTypeMeasurements(garmentTypeId || 0);

  // Log errors for debugging (remove in production)
  React.useEffect(() => {
    if (garmentTypesError) console.error("Garment types error:", garmentTypesError);
    if (sizesError) console.error("Sizes error:", sizesError);
    if (measurementSpecsError) console.error("Measurement specs error:", measurementSpecsError);
  }, [garmentTypesError, sizesError, measurementSpecsError]);

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  const filteredSizes = useMemo(() => {
    if (!sizes) return [];

    if (!searchQuery) return sizes;

    const searchLower = searchQuery.toLowerCase();
    return sizes.filter((size: SizeForSelector) =>
      size.size_code.toLowerCase().includes(searchLower) ||
      size.size_name.toLowerCase().includes(searchLower) ||
      size.size_label?.toLowerCase().includes(searchLower)
    );
  }, [sizes, searchQuery]);

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const handleSelectSize = useCallback((size: SizeForSelector) => {
    const isSelected = selectedSizes.some((s) => s.id === size.id);

    if (isSelected) {
      // Remove from selection
      onSizesChange(selectedSizes.filter((s) => s.id !== size.id));
    } else {
      // Check max selections
      if (selectedSizes.length >= maxSelections) return;

      // Add to selection
      const newSize: SelectedSize = {
        id: size.id,
        size_code: size.size_code,
        size_name: size.size_name,
        size_label: size.size_label,
        garment_type_name: size.garment_type_name,
        gender: size.gender,
        age_group: size.age_group,
        fit_type: size.fit_type,
        measurements_summary: size.measurements_summary,
      };
      onSizesChange([...selectedSizes, newSize]);
    }
  }, [selectedSizes, maxSelections, onSizesChange]);

  const handleSelectAll = useCallback(() => {
    if (!filteredSizes) return;

    // If all are selected, deselect all
    const allSelected = filteredSizes.every((size: SizeForSelector) =>
      selectedSizes.some((s) => s.id === size.id)
    );

    if (allSelected) {
      // Remove all filtered sizes from selection
      const filteredIds = new Set(filteredSizes.map((s: SizeForSelector) => s.id));
      onSizesChange(selectedSizes.filter((s) => !filteredIds.has(s.id)));
    } else {
      // Add all filtered sizes (up to max)
      const currentIds = new Set(selectedSizes.map((s) => s.id));
      const newSizes = filteredSizes
        .filter((size: SizeForSelector) => !currentIds.has(size.id))
        .slice(0, maxSelections - selectedSizes.length)
        .map((size: SizeForSelector): SelectedSize => ({
          id: size.id,
          size_code: size.size_code,
          size_name: size.size_name,
          size_label: size.size_label,
          garment_type_name: size.garment_type_name,
          gender: size.gender,
          age_group: size.age_group,
          fit_type: size.fit_type,
          measurements_summary: size.measurements_summary,
        }));
      onSizesChange([...selectedSizes, ...newSizes]);
    }
  }, [filteredSizes, selectedSizes, maxSelections, onSizesChange]);

  const handleRemoveSize = useCallback((size: SelectedSize) => {
    onSizesChange(selectedSizes.filter((s) => s.id !== size.id));
  }, [selectedSizes, onSizesChange]);

  const isSelected = useCallback((sizeId: number) => {
    return selectedSizes.some((s) => s.id === sizeId);
  }, [selectedSizes]);

  const toggleRowExpand = useCallback((sizeId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(sizeId)) {
        next.delete(sizeId);
      } else {
        next.add(sizeId);
      }
      return next;
    });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setGarmentTypeId(defaultGarmentTypeId);
    setGender("");
    setAgeGroup("");
    setFitType("");
    setSearchQuery("");
  }, [defaultGarmentTypeId]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedGarmentType = garmentTypes?.find((g: GarmentTypeForSelector) => g.id === garmentTypeId);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Sizes Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
        {selectedSizes.length === 0 ? (
          <span className="text-sm text-muted-foreground">No sizes selected</span>
        ) : (
          selectedSizes.map((size) => (
            <Badge
              key={size.id}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              <span className="text-xs font-medium">{size.size_name}</span>
              <span className="text-xs text-muted-foreground">
                ({size.garment_type_name}, {size.gender})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => handleRemoveSize(size)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Size Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-11"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Select Sizes ({selectedSizes.length}/{maxSelections})
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Sizes</DialogTitle>
            <DialogDescription>
              Filter by garment type to see available measurements. Select multiple sizes for your sample.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="w-48">
                <Select
                  value={garmentTypeId?.toString() || ""}
                  onValueChange={(v) => setGarmentTypeId(v ? parseInt(v) : undefined)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Garment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Garment Types</SelectItem>
                    {garmentTypes?.map((type: GarmentTypeForSelector) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Select
                  value={gender}
                  onValueChange={(v) => setGender(v as GenderEnum | "")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Select
                  value={ageGroup}
                  onValueChange={(v) => setAgeGroup(v as AgeGroupEnum | "")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ages</SelectItem>
                    {AGE_GROUPS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Select
                  value={fitType}
                  onValueChange={(v) => setFitType(v as FitTypeEnum | "")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Fit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Fits</SelectItem>
                    {FIT_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9"
                    placeholder="Search sizes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Measurement Specs Info */}
            {selectedGarmentType && measurementSpecs && measurementSpecs.length > 0 && (
              <div className="p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedGarmentType.name} Measurement Specs
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {measurementSpecs.map((spec: any) => (
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

            {/* Size Table */}
            <ScrollArea className="h-[400px] border rounded-md">
              {sizesLoading || garmentTypesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Ruler className="h-12 w-12 mb-2 opacity-50" />
                  <p>No sizes found with current filters</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={resetFilters}
                    className="mt-1"
                  >
                    Reset filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            filteredSizes.length > 0 &&
                            filteredSizes.every((size: SizeForSelector) =>
                              selectedSizes.some((s) => s.id === size.id)
                            )
                          }
                          onCheckedChange={handleSelectAll}
                          disabled={selectedSizes.length >= maxSelections}
                        />
                      </TableHead>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Size Code</TableHead>
                      <TableHead>Size Name</TableHead>
                      <TableHead>Garment Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Fit</TableHead>
                      <TableHead className="text-right">Measurements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSizes.map((size: SizeForSelector) => {
                      const selected = isSelected(size.id);
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
                                onCheckedChange={() => handleSelectSize(size)}
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
                            <TableCell className="font-mono font-medium">
                              {size.size_code}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{size.size_name}</span>
                                {size.size_label && (
                                  <Badge variant="outline" className="text-xs">
                                    {size.size_label}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{size.garment_type_name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {size.gender}
                              </Badge>
                            </TableCell>
                            <TableCell>{size.age_group}</TableCell>
                            <TableCell>{size.fit_type || "-"}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground max-w-[200px] truncate">
                              {size.measurements_summary || "No measurements"}
                            </TableCell>
                          </TableRow>

                          {/* Expanded Measurements Row */}
                          {expanded && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={9} className="py-3">
                                <div className="pl-12">
                                  <Label className="text-xs font-medium mb-2 block">
                                    Measurements
                                  </Label>
                                  {size.measurements_summary ? (
                                    <div className="flex flex-wrap gap-2">
                                      {size.measurements_summary.split(", ").map((m, idx) => {
                                        const [name, value] = m.split(": ");
                                        return (
                                          <div
                                            key={idx}
                                            className="px-2 py-1 rounded bg-background border text-xs"
                                          >
                                            <span className="text-muted-foreground">{name}: </span>
                                            <span className="font-medium">{value}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      No measurements recorded for this size
                                    </span>
                                  )}
                                </div>
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

export default SizeSelector;
