/**
 * Simple Size Selector for Sample Development
 * 
 * Features:
 * - Dropdown to select garment type
 * - Shows sizes for selected garment type
 * - Search and select functionality
 * - Based on existing size-master page patterns
 */

"use client";

import { useState, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, X, Ruler, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGarmentTypesForSelector,
  useSizes,
  type SizeMaster,
} from "@/hooks/use-sizecolor";

// ============================================================================
// TYPES
// ============================================================================

export interface SimpleSelectedSize {
  id: number;
  size_code: string;
  size_name: string;
  size_label?: string;
  garment_type_id: number;
  garment_type_name: string;
  gender: string;
  age_group: string;
  fit_type?: string;
  display_name: string;
}

interface SimpleSizeSelectorProps {
  selectedSizes: SimpleSelectedSize[];
  onSizesChange: (sizes: SimpleSelectedSize[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SimpleSizeSelector({
  selectedSizes,
  onSizesChange,
  maxSelections = 20,
  disabled = false,
  className,
}: SimpleSizeSelectorProps) {
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGarmentTypeId, setSelectedGarmentTypeId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch garment types
  const { data: garmentTypes = [], isLoading: garmentTypesLoading } = useGarmentTypesForSelector();

  // Fetch sizes for selected garment type
  const { data: sizes = [], isLoading: sizesLoading } = useSizes(
    selectedGarmentTypeId || undefined
  );

  // Filter sizes based on search
  const filteredSizes = useMemo(() => {
    if (!sizes) return [];
    
    let filtered = (sizes as SizeMaster[]).filter(size => size.is_active);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(size =>
        size.size_name.toLowerCase().includes(term) ||
        size.size_code.toLowerCase().includes(term) ||
        (size.size_label?.toLowerCase().includes(term)) ||
        size.gender.toLowerCase().includes(term) ||
        size.age_group.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [sizes, searchTerm]);

  // Check if size is selected
  const isSizeSelected = (size: SizeMaster) => {
    return selectedSizes.some(selected => selected.id === size.id);
  };

  // Handle size selection
  const handleSizeSelect = (size: SizeMaster) => {
    const isSelected = isSizeSelected(size);
    
    if (isSelected) {
      // Remove size
      onSizesChange(selectedSizes.filter(selected => selected.id !== size.id));
    } else {
      // Add size (if not at max)
      if (selectedSizes.length >= maxSelections) return;
      
      // Find garment type name
      const garmentType = garmentTypes.find((gt: any) => gt.id === size.garment_type_id);
      
      const newSize: SimpleSelectedSize = {
        id: size.id,
        size_code: size.size_code,
        size_name: size.size_name,
        size_label: size.size_label,
        garment_type_id: size.garment_type_id,
        garment_type_name: garmentType?.name || "Unknown",
        gender: size.gender,
        age_group: size.age_group,
        fit_type: size.fit_type,
        display_name: `${size.size_name} (${garmentType?.name || "Unknown"} - ${size.gender})`,
      };
      
      onSizesChange([...selectedSizes, newSize]);
    }
  };

  // Remove selected size
  const handleRemoveSize = (size: SimpleSelectedSize) => {
    onSizesChange(selectedSizes.filter(selected => selected.id !== size.id));
  };

  // Get selected garment type name
  const selectedGarmentTypeName = useMemo(() => {
    if (!selectedGarmentTypeId) return "";
    const garmentType = garmentTypes.find((gt: any) => gt.id === selectedGarmentTypeId);
    return garmentType?.name || "";
  }, [selectedGarmentTypeId, garmentTypes]);

  const isLoading = garmentTypesLoading || sizesLoading;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Sizes Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
        {selectedSizes.length === 0 ? (
          <span className="text-sm text-muted-foreground">No sizes selected</span>
        ) : (
          selectedSizes.map((size, index) => (
            <Badge
              key={`${size.id}-${index}`}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              <span className="text-xs">{size.display_name}</span>
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
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Sizes</DialogTitle>
            <DialogDescription>
              Choose garment type and select sizes from the master list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Garment Type Selection */}
            <div className="flex gap-4">
              <div className="w-64">
                <Label className="text-sm font-medium">Garment Type</Label>
                <Select 
                  value={selectedGarmentTypeId?.toString() || ""} 
                  onValueChange={(v) => {
                    setSelectedGarmentTypeId(v ? parseInt(v) : null);
                    setSearchTerm(""); // Clear search when changing garment type
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select garment type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {garmentTypes.map((garmentType: any) => (
                      <SelectItem key={garmentType.id} value={garmentType.id.toString()}>
                        {garmentType.name} ({garmentType.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium">Search Sizes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9"
                    placeholder="Search sizes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!selectedGarmentTypeId}
                  />
                </div>
              </div>
            </div>

            {/* Info about selected garment type */}
            {selectedGarmentTypeId && (
              <div className="p-3 bg-muted/30 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Showing sizes for: <span className="font-medium">{selectedGarmentTypeName}</span>
                </p>
              </div>
            )}

            {/* Sizes Grid */}
            <ScrollArea className="h-[400px]">
              {!selectedGarmentTypeId ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  Please select a garment type to view sizes
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSizes.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  {searchTerm ? "No sizes found matching your search" : "No sizes available for this garment type"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pr-4">
                  {filteredSizes.map((size) => {
                    const isSelected = isSizeSelected(size);
                    
                    return (
                      <div
                        key={size.id}
                        onClick={() => handleSizeSelect(size)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:border-gray-300 hover:bg-muted/50"
                        )}
                      >
                        {/* Size Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{size.size_name}</span>
                            {size.size_label && (
                              <Badge variant="outline" className="text-xs">
                                {size.size_label}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {size.gender} • {size.age_group}
                            {size.fit_type && ` • ${size.fit_type}`}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Code: {size.size_code}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
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

export default SimpleSizeSelector;