/**
 * UnitSelector Component
 * 
 * Searchable dropdown component for unit selection using the Unit Conversion System.
 * Replaces plain text unit fields with unit_id references.
 * 
 * Features:
 * - Searchable dropdown using Command component
 * - Groups units by category with headers
 * - Displays unit as "{name} ({symbol})"
 * - Supports categoryFilter prop to filter by category
 * - Handles selection and onChange callback with unit_id
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

"use client";

import React, { useState, useMemo } from 'react';
import { useUnits, useUnitSearch, type UnitWithCategory } from '@/hooks/use-units';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Ruler, Scale, Hash, Layers, Package, Square, Beaker, Clock, Waypoints, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface UnitSelectorProps {
  value?: number;  // unit_id
  onChange: (unitId: number) => void;
  categoryFilter?: string;  // Filter by category name
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// CATEGORY ICONS
// ============================================================================

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Length: <Ruler className="h-3.5 w-3.5" />,
  Weight: <Scale className="h-3.5 w-3.5" />,
  Quantity: <Hash className="h-3.5 w-3.5" />,
  Count: <Hash className="h-3.5 w-3.5" />,
  "Textile Density": <Layers className="h-3.5 w-3.5" />,
  "Textile - Fabric Weight": <Layers className="h-3.5 w-3.5" />,
  "Yarn Count": <Waypoints className="h-3.5 w-3.5" />,
  Packaging: <Package className="h-3.5 w-3.5" />,
  Area: <Square className="h-3.5 w-3.5" />,
  Volume: <Beaker className="h-3.5 w-3.5" />,
  Time: <Clock className="h-3.5 w-3.5" />,
  Temperature: <Beaker className="h-3.5 w-3.5" />,
  Pressure: <Beaker className="h-3.5 w-3.5" />,
  Energy: <Beaker className="h-3.5 w-3.5" />,
  Power: <Beaker className="h-3.5 w-3.5" />,
  Force: <Beaker className="h-3.5 w-3.5" />,
  Velocity: <Beaker className="h-3.5 w-3.5" />,
  Acceleration: <Beaker className="h-3.5 w-3.5" />,
  Frequency: <Beaker className="h-3.5 w-3.5" />,
  "Electric Current": <Beaker className="h-3.5 w-3.5" />,
  "Electric Potential": <Beaker className="h-3.5 w-3.5" />,
  "Electric Resistance": <Beaker className="h-3.5 w-3.5" />,
  "Electric Capacitance": <Beaker className="h-3.5 w-3.5" />,
  "Magnetic Field": <Beaker className="h-3.5 w-3.5" />,
  "Luminous Intensity": <Beaker className="h-3.5 w-3.5" />,
  "Amount of Substance": <Beaker className="h-3.5 w-3.5" />,
  Angle: <Beaker className="h-3.5 w-3.5" />,
  "Solid Angle": <Beaker className="h-3.5 w-3.5" />,
  "Data Storage": <Package className="h-3.5 w-3.5" />,
  "Data Transfer Rate": <Package className="h-3.5 w-3.5" />,
  Density: <Scale className="h-3.5 w-3.5" />,
  "Fuel Economy": <Beaker className="h-3.5 w-3.5" />,
  "Flow Rate": <Beaker className="h-3.5 w-3.5" />,
  "Textile - Linear Density": <Waypoints className="h-3.5 w-3.5" />,
  "Textile - Yarn Count": <Waypoints className="h-3.5 w-3.5" />,
  "Textile - Fabric Count": <Layers className="h-3.5 w-3.5" />,
  "Textile - Fabric Thickness": <Layers className="h-3.5 w-3.5" />,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function UnitSelector({
  value,
  onChange,
  categoryFilter,
  placeholder = "Select unit...",
  disabled = false,
  className,
}: UnitSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the existing useUnits hook for data fetching
  const { data: units = [], isLoading, error, refetch } = useUnits();
  
  // Use the existing useUnitSearch hook for local filtering
  const { searchUnits } = useUnitSearch();
  
  // Filter units by category if specified and apply search
  const filteredUnits = useMemo(() => {
    let filtered: UnitWithCategory[] = units;
    
    // Apply search filtering using the useUnitSearch hook
    if (search.trim() || categoryFilter) {
      filtered = searchUnits(search, categoryFilter);
    }
    
    // Only show active units
    filtered = filtered.filter(unit => unit.is_active);
    
    return filtered;
  }, [units, categoryFilter, search, searchUnits]);
  
  // Group units by category
  const groupedUnits = useMemo(() => {
    const groups: Record<string, UnitWithCategory[]> = {};
    
    filteredUnits.forEach(unit => {
      const categoryName = unit.category_name || 'Other';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(unit);
    });
    
    // Sort units within each category by sort_order, then by name
    Object.keys(groups).forEach(categoryName => {
      groups[categoryName].sort((a, b) => {
        const sortOrderCompare = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortOrderCompare !== 0) return sortOrderCompare;
        return a.name.localeCompare(b.name);
      });
    });
    
    return groups;
  }, [filteredUnits]);
  
  // Find selected unit
  const selectedUnit = units.find((u: UnitWithCategory) => u.id === value);
  
  const handleSelect = (unitId: number) => {
    onChange(unitId);
    setOpen(false);
    setSearch('');
  };
  
  // Handle retry for unit data fetch failure
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to retry unit data fetch:', err);
    }
  };
  
  // Error state rendering
  if (error && !isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <Button
          variant="outline"
          disabled={true}
          className="w-full justify-between text-destructive border-destructive/50"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Failed to load units
          </span>
        </Button>
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="text-sm text-destructive mb-2">
            <strong>Unit data unavailable:</strong> {error.message || 'Unable to load unit data'}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry ({retryCount > 0 ? `${retryCount + 1}` : '1'})
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Refresh Page
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            If this problem persists, please contact support.
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn("w-full justify-between font-normal", className)}
        >
          {isLoading ? (
            "Loading units..."
          ) : selectedUnit ? (
            <span className="flex items-center gap-2">
              {CATEGORY_ICONS[selectedUnit.category_name || ''] || null}
              <span>{selectedUnit.name} ({selectedUnit.symbol})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search units..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No unit found.</CommandEmpty>
            {Object.entries(groupedUnits)
              .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
              .map(([categoryName, categoryUnits]) => (
                <CommandGroup 
                  key={categoryName} 
                  heading={
                    <span className="flex items-center gap-2 text-xs font-medium">
                      {CATEGORY_ICONS[categoryName] || null}
                      {categoryName}
                    </span>
                  }
                >
                  {categoryUnits.map(unit => (
                    <CommandItem
                      key={unit.id}
                      value={`${unit.name}-${unit.symbol}-${unit.id}`}
                      onSelect={() => handleSelect(unit.id)}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === unit.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">
                          {unit.name} ({unit.symbol})
                        </span>
                        {unit.unit_type && (
                          <span className="text-xs text-muted-foreground">
                            {unit.unit_type}
                            {unit.region && ` • ${unit.region}`}
                          </span>
                        )}
                      </div>
                      {unit.is_base && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          BASE
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default UnitSelector;