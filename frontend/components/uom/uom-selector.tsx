"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown, Ruler, Scale, Hash, Layers, Package, Square, Beaker, Clock, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUoMsForSelector, type UoMForSelector } from "@/hooks/use-uom";

interface UoMSelectorProps {
  value: string;
  onChange: (value: string) => void;
  categoryFilter?: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showSymbolOnly?: boolean;
  className?: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Length: <Ruler className="h-3.5 w-3.5" />,
  Weight: <Scale className="h-3.5 w-3.5" />,
  Quantity: <Hash className="h-3.5 w-3.5" />,
  "Textile Density": <Layers className="h-3.5 w-3.5" />,
  "Yarn Count": <Waypoints className="h-3.5 w-3.5" />,
  Packaging: <Package className="h-3.5 w-3.5" />,
  Area: <Square className="h-3.5 w-3.5" />,
  Volume: <Beaker className="h-3.5 w-3.5" />,
  Time: <Clock className="h-3.5 w-3.5" />,
};

/**
 * Reusable UOM Selector component with searchable combobox
 *
 * Fetches UOMs from database and displays them grouped by category.
 * Returns the symbol value for backward compatibility with string-based storage.
 */
export function UoMSelector({
  value,
  onChange,
  categoryFilter,
  placeholder = "Select UoM",
  disabled = false,
  required: _required = false,
  showSymbolOnly = false,
  className,
}: UoMSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Note: required is passed for interface consistency but validation should be handled by parent form

  // Fetch UOMs for selector
  const { data: uoms = [], isLoading } = useUoMsForSelector();

  // Filter and group UOMs by category
  const groupedUoms = useMemo(() => {
    let filtered = uoms as UoMForSelector[];

    // Apply category filter if provided
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter((uom) =>
        categoryFilter.some(
          (cat) =>
            uom.category_name?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Group by category
    const groups: Record<string, UoMForSelector[]> = {};
    filtered.forEach((uom) => {
      const categoryName = uom.category_name || "Other";
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(uom);
    });

    return groups;
  }, [uoms, categoryFilter]);

  // Get display text for selected value
  const selectedUom = useMemo(() => {
    if (!value || !uoms) return null;
    return (uoms as UoMForSelector[]).find((uom) => uom.symbol === value);
  }, [value, uoms]);

  const getDisplayText = (uom: UoMForSelector) => {
    if (showSymbolOnly) {
      return uom.symbol;
    }
    return uom.display_name || `${uom.name} (${uom.symbol})`;
  };

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : selectedUom ? (
            <span className="flex items-center gap-2">
              {CATEGORY_ICONS[selectedUom.category_name || ""] || null}
              {getDisplayText(selectedUom)}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search units..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No unit found.</CommandEmpty>
            {Object.entries(groupedUoms).map(([categoryName, units]) => {
              // Filter units based on search term
              const filteredUnits = searchTerm
                ? units.filter(
                    (uom) =>
                      uom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      uom.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      uom.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                : units;

              if (filteredUnits.length === 0) return null;

              return (
                <CommandGroup
                  key={categoryName}
                  heading={
                    <span className="flex items-center gap-2 text-xs">
                      {CATEGORY_ICONS[categoryName] || null}
                      {categoryName}
                    </span>
                  }
                >
                  {filteredUnits.map((uom) => (
                    <CommandItem
                      key={uom.id}
                      value={`${uom.symbol}-${uom.name}`}
                      onSelect={() => handleSelect(uom.symbol)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === uom.symbol ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{getDisplayText(uom)}</span>
                      {uom.is_base && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          BASE
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Simple UOM Selector without grouping
 * Use this for simpler use cases or when you want a flat list
 */
export function UoMSelectorSimple({
  value,
  onChange,
  categoryFilter,
  placeholder = "Select UoM",
  disabled = false,
  required = false,
  className,
}: Omit<UoMSelectorProps, "showSymbolOnly">) {
  const { data: uoms = [], isLoading } = useUoMsForSelector();

  // Filter UOMs
  const filteredUoms = useMemo(() => {
    let filtered = uoms as UoMForSelector[];

    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter((uom) =>
        categoryFilter.some(
          (cat) =>
            uom.category_name?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    return filtered;
  }, [uoms, categoryFilter]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || isLoading}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredUoms.map((uom) => (
          <SelectItem key={uom.id} value={uom.symbol}>
            {uom.display_name || `${uom.name} (${uom.symbol})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default UoMSelector;
