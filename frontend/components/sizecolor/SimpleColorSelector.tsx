/**
 * Simple Color Selector for Sample Development
 * 
 * Features:
 * - Dropdown to select color type (Pantone, TCX, H&M, RGB)
 * - Shows colors based on selected type
 * - Search and select functionality
 * - Based on existing color-master page patterns
 */

"use client";

import React, { useState, useMemo } from "react";
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
import { Check, ChevronsUpDown, X, Palette, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  useUniversalColors,
  useHMColors,
  type UniversalColor,
  type HMColor,
} from "@/hooks/use-sizecolor";

// ============================================================================
// TYPES
// ============================================================================

export type ColorType = "pantone" | "tcx" | "hm" | "rgb";

export interface SimpleSelectedColor {
  id: number;
  type: ColorType;
  code: string;
  name: string;
  hex_code?: string;
  display_name: string;
}

interface SimpleColorSelectorProps {
  selectedColors: SimpleSelectedColor[];
  onColorsChange: (colors: SimpleSelectedColor[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SimpleColorSelector({
  selectedColors,
  onColorsChange,
  maxSelections = 10,
  disabled = false,
  className,
}: SimpleColorSelectorProps) {
  const { token } = useAuth();
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<ColorType>("pantone");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch colors based on type
  const { data: universalColors = [], isLoading: universalLoading } = useUniversalColors();
  const { data: hmColors = [], isLoading: hmLoading } = useHMColors();

  // Filter colors based on selected type and search
  const filteredColors = useMemo(() => {
    let colors: any[] = [];

    if (selectedColorType === "hm") {
      colors = (hmColors as HMColor[]).filter(color => 
        color.is_active &&
        (searchTerm === "" || 
         color.color_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
         color.color_master.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      // For pantone, tcx, rgb - filter universal colors
      colors = (universalColors as UniversalColor[]).filter(color => {
        if (!color.is_active) return false;
        
        // Filter by type
        let hasRequiredCode = false;
        if (selectedColorType === "pantone" && color.pantone_code) hasRequiredCode = true;
        if (selectedColorType === "tcx" && color.tcx_code) hasRequiredCode = true;
        if (selectedColorType === "rgb") hasRequiredCode = true; // All colors have hex/rgb
        
        if (!hasRequiredCode) return false;

        // Filter by search term
        if (searchTerm === "") return true;
        
        const term = searchTerm.toLowerCase();
        return (
          color.color_name.toLowerCase().includes(term) ||
          color.color_code.toLowerCase().includes(term) ||
          (color.pantone_code?.toLowerCase().includes(term)) ||
          (color.tcx_code?.toLowerCase().includes(term)) ||
          color.hex_code.toLowerCase().includes(term)
        );
      });
    }

    return colors;
  }, [selectedColorType, searchTerm, universalColors, hmColors]);

  // Check if color is selected
  const isColorSelected = (color: any) => {
    return selectedColors.some(selected => 
      selected.id === color.id && 
      selected.type === selectedColorType
    );
  };

  // Handle color selection
  const handleColorSelect = (color: any) => {
    const isSelected = isColorSelected(color);
    
    if (isSelected) {
      // Remove color
      onColorsChange(selectedColors.filter(selected => 
        !(selected.id === color.id && selected.type === selectedColorType)
      ));
    } else {
      // Add color (if not at max)
      if (selectedColors.length >= maxSelections) return;
      
      let newColor: SimpleSelectedColor;
      
      if (selectedColorType === "hm") {
        newColor = {
          id: color.id,
          type: "hm",
          code: color.color_code,
          name: color.color_master,
          display_name: `${color.color_master} (${color.color_code})`,
        };
      } else {
        let code = "";
        if (selectedColorType === "pantone") code = color.pantone_code || color.color_code;
        else if (selectedColorType === "tcx") code = color.tcx_code || color.color_code;
        else if (selectedColorType === "rgb") code = color.hex_code;
        
        newColor = {
          id: color.id,
          type: selectedColorType,
          code: code,
          name: color.color_name,
          hex_code: color.hex_code,
          display_name: `${color.color_name} (${code})`,
        };
      }
      
      onColorsChange([...selectedColors, newColor]);
    }
  };

  // Remove selected color
  const handleRemoveColor = (color: SimpleSelectedColor) => {
    onColorsChange(selectedColors.filter(selected => 
      !(selected.id === color.id && selected.type === color.type)
    ));
  };

  // Render color swatch
  const renderColorSwatch = (hexCode?: string, size: "sm" | "md" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
    };

    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded border border-gray-300 flex-shrink-0"
        )}
        style={{ backgroundColor: hexCode || "#CCCCCC" }}
      />
    );
  };

  const isLoading = universalLoading || hmLoading;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Colors Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
        {selectedColors.length === 0 ? (
          <span className="text-sm text-muted-foreground">No colors selected</span>
        ) : (
          selectedColors.map((color, index) => (
            <Badge
              key={`${color.type}-${color.id}-${index}`}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              {color.hex_code && renderColorSwatch(color.hex_code, "sm")}
              <span className="text-xs">{color.display_name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => handleRemoveColor(color)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Color Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-11"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Select Colors ({selectedColors.length}/{maxSelections})
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Colors</DialogTitle>
            <DialogDescription>
              Choose color type and select colors from the master list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Color Type Selection */}
            <div className="flex gap-4">
              <div className="w-48">
                <Label className="text-sm font-medium">Color Type</Label>
                <Select value={selectedColorType} onValueChange={(v: ColorType) => {
                  setSelectedColorType(v);
                  setSearchTerm(""); // Clear search when changing type
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pantone">Pantone Codes</SelectItem>
                    <SelectItem value="tcx">TCX Codes</SelectItem>
                    <SelectItem value="hm">H&M Codes</SelectItem>
                    <SelectItem value="rgb">RGB/Hex Codes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium">Search Colors</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9"
                    placeholder={`Search ${selectedColorType.toUpperCase()} colors...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Colors Grid */}
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredColors.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  {searchTerm ? "No colors found matching your search" : `No ${selectedColorType.toUpperCase()} colors available`}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pr-4">
                  {filteredColors.map((color) => {
                    const isSelected = isColorSelected(color);
                    
                    return (
                      <div
                        key={color.id}
                        onClick={() => handleColorSelect(color)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:border-gray-300 hover:bg-muted/50"
                        )}
                      >
                        {/* Color Swatch (only for non-H&M colors) */}
                        {selectedColorType !== "hm" && renderColorSwatch(color.hex_code)}
                        
                        {/* Color Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {selectedColorType === "hm" ? color.color_master : color.color_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {selectedColorType === "hm" ? (
                              `Code: ${color.color_code}${color.color_value ? ` • ${color.color_value}` : ""}`
                            ) : selectedColorType === "pantone" ? (
                              `Pantone: ${color.pantone_code || "N/A"} • Hex: ${color.hex_code}`
                            ) : selectedColorType === "tcx" ? (
                              `TCX: ${color.tcx_code || "N/A"} • Hex: ${color.hex_code}`
                            ) : (
                              `Hex: ${color.hex_code} • RGB: ${color.rgb_r || 0}, ${color.rgb_g || 0}, ${color.rgb_b || 0}`
                            )}
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
                {selectedColors.length} of {maxSelections} colors selected
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onColorsChange([])}
                  disabled={selectedColors.length === 0}
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

export default SimpleColorSelector;