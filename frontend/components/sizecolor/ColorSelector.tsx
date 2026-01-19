/**
 * ColorSelector Component for Sample Development Form
 *
 * Supports two color systems:
 * - Universal Colors: Pantone/TCX/RGB/Hex codes
 * - H&M Colors: Proprietary 5-digit codes (XX-XXX)
 *
 * Usage in Sample Development form:
 * 1. User selects color type (Pantone, TCX, RGB, Hex, H&M)
 * 2. User enters code or searches
 * 3. Color auto-displays with preview
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, X, Palette, Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUniversalColorsForSelector,
  useHMColorsForSelector,
  useHMColorGroups,
  useUniversalColorByCode,
  useHMColorByCode,
  type UniversalColorForSelector,
  type HMColorForSelector,
  type ColorFamilyEnum,
} from "@/hooks/use-sizecolor";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ColorSearchType = "pantone" | "tcx" | "hex" | "rgb" | "hm";

export interface SelectedColor {
  id: number;
  type: "universal" | "hm";
  code: string;
  name: string;
  hex_code: string;
  display_name: string;
}

interface ColorSelectorProps {
  selectedColors: SelectedColor[];
  onColorsChange: (colors: SelectedColor[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// H&M COLOR GROUP REFERENCE
// ============================================================================

const HM_COLOR_GROUPS = [
  { code: "01-09", name: "Achromatic", colors: "White, Black, Grey" },
  { code: "10-19", name: "Red", colors: "Red shades" },
  { code: "20-29", name: "Yellow", colors: "Yellow, Gold shades" },
  { code: "30-39", name: "Green", colors: "Green shades" },
  { code: "40-49", name: "Blue", colors: "Blue shades" },
  { code: "50-59", name: "Violet/Purple", colors: "Purple, Violet shades" },
  { code: "60-69", name: "Brown/Earth", colors: "Brown, Tan, Khaki" },
  { code: "70-79", name: "Pink", colors: "Pink shades" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ColorSelector({
  selectedColors,
  onColorsChange,
  maxSelections = 10,
  disabled = false,
  className,
}: ColorSelectorProps) {
  // Dialog & Tab state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"universal" | "hm">("universal");

  // Search state for Universal Colors
  const [universalSearchType, setUniversalSearchType] = useState<ColorSearchType>("pantone");
  const [universalSearchCode, setUniversalSearchCode] = useState("");
  const [universalColorFamily, setUniversalColorFamily] = useState<ColorFamilyEnum | "">("");

  // Search state for H&M Colors
  const [hmSearchCode, setHmSearchCode] = useState("");
  const [hmGroupFilter, setHmGroupFilter] = useState<number | undefined>();

  // Quick search popover
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);

  // Fetch data using hooks with error handling
  const { data: universalColors, isLoading: universalLoading, error: universalError } = useUniversalColorsForSelector(
    universalColorFamily || undefined
  );
  const { data: hmColors, isLoading: hmLoading, error: hmError } = useHMColorsForSelector(hmGroupFilter);
  const { data: hmColorGroups, error: hmGroupsError } = useHMColorGroups();

  // Code lookup hooks
  const { data: universalColorByCode, isLoading: universalCodeLoading } = useUniversalColorByCode(
    universalSearchCode.length >= 3 ? universalSearchCode : ""
  );
  const { data: hmColorByCode, isLoading: hmCodeLoading } = useHMColorByCode(
    hmSearchCode.length >= 5 ? hmSearchCode : ""
  );

  // Log errors for debugging (remove in production)
  React.useEffect(() => {
    if (universalError) console.error("Universal colors error:", universalError);
    if (hmError) console.error("HM colors error:", hmError);
    if (hmGroupsError) console.error("HM groups error:", hmGroupsError);
  }, [universalError, hmError, hmGroupsError]);

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  const filteredUniversalColors = useMemo(() => {
    if (!universalColors) return [];

    let filtered = [...universalColors];

    // Filter by search code based on type
    if (universalSearchCode) {
      const searchLower = universalSearchCode.toLowerCase();
      filtered = filtered.filter((color: UniversalColorForSelector) => {
        switch (universalSearchType) {
          case "pantone":
            return color.pantone_code?.toLowerCase().includes(searchLower);
          case "tcx":
            return color.tcx_code?.toLowerCase().includes(searchLower);
          case "hex":
            return color.hex_code?.toLowerCase().includes(searchLower);
          case "rgb":
            // Search by name or code for RGB
            return color.color_name.toLowerCase().includes(searchLower) ||
                   color.color_code.toLowerCase().includes(searchLower);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [universalColors, universalSearchCode, universalSearchType]);

  const filteredHmColors = useMemo(() => {
    if (!hmColors) return [];

    if (!hmSearchCode) return hmColors;

    const searchLower = hmSearchCode.toLowerCase();
    return hmColors.filter((color: HMColorForSelector) =>
      color.hm_code.toLowerCase().includes(searchLower) ||
      color.hm_name.toLowerCase().includes(searchLower)
    );
  }, [hmColors, hmSearchCode]);

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const handleSelectUniversalColor = useCallback((color: UniversalColorForSelector) => {
    if (selectedColors.length >= maxSelections) return;

    // Check if already selected
    const isSelected = selectedColors.some(
      (c) => c.type === "universal" && c.id === color.id
    );

    if (isSelected) {
      // Remove from selection
      onColorsChange(selectedColors.filter((c) => !(c.type === "universal" && c.id === color.id)));
    } else {
      // Add to selection
      const newColor: SelectedColor = {
        id: color.id,
        type: "universal",
        code: color.pantone_code || color.tcx_code || color.color_code,
        name: color.color_name,
        hex_code: color.hex_code,
        display_name: `${color.color_name} (${color.pantone_code || color.tcx_code || color.color_code})`,
      };
      onColorsChange([...selectedColors, newColor]);
    }
  }, [selectedColors, maxSelections, onColorsChange]);

  const handleSelectHmColor = useCallback((color: HMColorForSelector) => {
    if (selectedColors.length >= maxSelections) return;

    // Check if already selected
    const isSelected = selectedColors.some(
      (c) => c.type === "hm" && c.id === color.id
    );

    if (isSelected) {
      // Remove from selection
      onColorsChange(selectedColors.filter((c) => !(c.type === "hm" && c.id === color.id)));
    } else {
      // Add to selection
      const newColor: SelectedColor = {
        id: color.id,
        type: "hm",
        code: color.hm_code,
        name: color.hm_name,
        hex_code: color.hex_code || "#CCCCCC",
        display_name: `${color.hm_name} (${color.hm_code})`,
      };
      onColorsChange([...selectedColors, newColor]);
    }
  }, [selectedColors, maxSelections, onColorsChange]);

  const handleRemoveColor = useCallback((color: SelectedColor) => {
    onColorsChange(selectedColors.filter((c) => !(c.type === color.type && c.id === color.id)));
  }, [selectedColors, onColorsChange]);

  const isUniversalSelected = useCallback((colorId: number) => {
    return selectedColors.some((c) => c.type === "universal" && c.id === colorId);
  }, [selectedColors]);

  const isHmSelected = useCallback((colorId: number) => {
    return selectedColors.some((c) => c.type === "hm" && c.id === colorId);
  }, [selectedColors]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderColorSwatch = (hexCode: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Colors Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
        {selectedColors.length === 0 ? (
          <span className="text-sm text-muted-foreground">No colors selected</span>
        ) : (
          selectedColors.map((color) => (
            <Badge
              key={`${color.type}-${color.id}`}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              {renderColorSwatch(color.hex_code, "sm")}
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
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Colors</DialogTitle>
            <DialogDescription>
              Choose colors from Universal Colors (Pantone/TCX/Hex) or H&M proprietary codes
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "universal" | "hm")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="universal">Universal Colors</TabsTrigger>
              <TabsTrigger value="hm">H&M Colors</TabsTrigger>
            </TabsList>

            {/* Universal Colors Tab */}
            <TabsContent value="universal" className="space-y-4">
              {/* Search Controls */}
              <div className="flex gap-4">
                <div className="w-40">
                  <Label className="text-xs text-muted-foreground">Search By</Label>
                  <Select
                    value={universalSearchType}
                    onValueChange={(v) => setUniversalSearchType(v as ColorSearchType)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pantone">Pantone Code</SelectItem>
                      <SelectItem value="tcx">TCX Code</SelectItem>
                      <SelectItem value="hex">Hex Code</SelectItem>
                      <SelectItem value="rgb">Name/Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Enter {universalSearchType.toUpperCase()} Code
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="h-9 pl-9"
                      placeholder={`Search by ${universalSearchType} code...`}
                      value={universalSearchCode}
                      onChange={(e) => setUniversalSearchCode(e.target.value)}
                    />
                    {universalCodeLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>

                <div className="w-40">
                  <Label className="text-xs text-muted-foreground">Color Family</Label>
                  <Select
                    value={universalColorFamily}
                    onValueChange={(v) => setUniversalColorFamily(v as ColorFamilyEnum | "")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Families</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Orange">Orange</SelectItem>
                      <SelectItem value="Yellow">Yellow</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Purple">Purple</SelectItem>
                      <SelectItem value="Pink">Pink</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Grey">Grey</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Beige">Beige</SelectItem>
                      <SelectItem value="Navy">Navy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Code Lookup Result */}
              {universalColorByCode && universalSearchCode.length >= 3 && (
                <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    {renderColorSwatch(universalColorByCode.hex_code, "lg")}
                    <div className="flex-1">
                      <div className="font-medium">{universalColorByCode.color_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {universalColorByCode.pantone_code && <span className="mr-3">Pantone: {universalColorByCode.pantone_code}</span>}
                        {universalColorByCode.tcx_code && <span className="mr-3">TCX: {universalColorByCode.tcx_code}</span>}
                        <span>Hex: {universalColorByCode.hex_code}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isUniversalSelected(universalColorByCode.id) ? "secondary" : "default"}
                      onClick={() => handleSelectUniversalColor(universalColorByCode)}
                      disabled={selectedColors.length >= maxSelections && !isUniversalSelected(universalColorByCode.id)}
                    >
                      {isUniversalSelected(universalColorByCode.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Select
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Color Grid */}
              <ScrollArea className="h-[350px]">
                {universalLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUniversalColors.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No colors found
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pr-4">
                    {filteredUniversalColors.map((color: UniversalColorForSelector) => {
                      const isSelected = isUniversalSelected(color.id);
                      return (
                        <div
                          key={color.id}
                          onClick={() => handleSelectUniversalColor(color)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-gray-300 hover:bg-muted/50"
                          )}
                        >
                          {renderColorSwatch(color.hex_code, "md")}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{color.color_name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {color.pantone_code || color.tcx_code || color.color_code}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* H&M Colors Tab */}
            <TabsContent value="hm" className="space-y-4">
              {/* Search Controls */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Search H&M Code (XX-XXX)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="h-9 pl-9"
                      placeholder="Enter H&M code (e.g., 10-123)..."
                      value={hmSearchCode}
                      onChange={(e) => setHmSearchCode(e.target.value)}
                    />
                    {hmCodeLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>

                <div className="w-48">
                  <Label className="text-xs text-muted-foreground">Color Group</Label>
                  <Select
                    value={hmGroupFilter?.toString() || ""}
                    onValueChange={(v) => setHmGroupFilter(v ? parseInt(v) : undefined)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Groups</SelectItem>
                      {hmColorGroups?.map((group: any) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.group_code}: {group.group_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* H&M Code Lookup Result */}
              {hmColorByCode && hmSearchCode.length >= 5 && (
                <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    {renderColorSwatch(hmColorByCode.hex_code || "#CCCCCC", "lg")}
                    <div className="flex-1">
                      <div className="font-medium">{hmColorByCode.hm_name}</div>
                      <div className="text-sm text-muted-foreground">
                        H&M Code: {hmColorByCode.hm_code}
                        {hmColorByCode.group_name && <span className="ml-3">Group: {hmColorByCode.group_name}</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isHmSelected(hmColorByCode.id) ? "secondary" : "default"}
                      onClick={() => handleSelectHmColor(hmColorByCode)}
                      disabled={selectedColors.length >= maxSelections && !isHmSelected(hmColorByCode.id)}
                    >
                      {isHmSelected(hmColorByCode.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Select
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* H&M Color Group Reference */}
              <div className="border rounded-md p-3 bg-muted/30">
                <Label className="text-xs font-medium mb-2 block">H&M Color Group Reference</Label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {HM_COLOR_GROUPS.map((group) => (
                    <div key={group.code} className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {group.code}
                      </Badge>
                      <span className="text-muted-foreground">{group.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Grid */}
              <ScrollArea className="h-[280px]">
                {hmLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredHmColors.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No H&M colors found
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pr-4">
                    {filteredHmColors.map((color: HMColorForSelector) => {
                      const isSelected = isHmSelected(color.id);
                      return (
                        <div
                          key={color.id}
                          onClick={() => handleSelectHmColor(color)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-gray-300 hover:bg-muted/50"
                          )}
                        >
                          {renderColorSwatch(color.hex_code || "#CCCCCC", "md")}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{color.hm_name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {color.hm_code}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

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

export default ColorSelector;
