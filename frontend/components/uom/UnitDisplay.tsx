/**
 * UnitDisplay Component
 * 
 * Display component for showing unit symbols next to quantities with tooltips.
 * Shows unit symbol, full unit name on hover, and unit type information.
 * Handles inactive units with deprecation markers.
 * 
 * Features:
 * - Display unit symbol next to quantity
 * - Show tooltip with full unit name on hover
 * - Support showing unit type (SI, Desi, Textile, etc.)
 * - Handle inactive units with deprecation marker
 * - Flexible display options (symbol only, name only, or both)
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.5, 11.5**
 */

"use client";

import React from 'react';
import { useUnits, useUnitSearch, type UnitWithCategory } from '@/hooks/use-units';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface UnitDisplayProps {
  unitId: number;
  showFullName?: boolean;  // Show full unit name instead of just symbol
  showUnitType?: boolean;  // Show unit type badge (SI, Desi, etc.)
  showDeprecationWarning?: boolean;  // Show warning for inactive units
  className?: string;
  symbolClassName?: string;
  nameClassName?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

// ============================================================================
// UNIT TYPE COLORS
// ============================================================================

const UNIT_TYPE_COLORS: Record<string, string> = {
  SI: 'bg-blue-100 text-blue-800 border-blue-200',
  International: 'bg-green-100 text-green-800 border-green-200',
  Desi: 'bg-orange-100 text-orange-800 border-orange-200',
  English: 'bg-purple-100 text-purple-800 border-purple-200',
  CGS: 'bg-gray-100 text-gray-800 border-gray-200',
  Textile: 'bg-pink-100 text-pink-800 border-pink-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function UnitDisplay({
  unitId,
  showFullName = false,
  showUnitType = false,
  showDeprecationWarning = true,
  className,
  symbolClassName,
  nameClassName,
  tooltipSide = 'top',
}: UnitDisplayProps) {
  const { findUnitById, error: unitsError, isLoading } = useUnitSearch();
  
  // Find the unit by ID
  const unit = findUnitById(unitId);
  
  // Handle loading state
  if (isLoading) {
    return (
      <span className={cn("text-muted-foreground animate-pulse", className)}>
        Loading...
      </span>
    );
  }
  
  // Handle units data fetch error
  if (unitsError) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("text-destructive flex items-center gap-1", className)}>
            <AlertTriangle className="h-3 w-3" />
            Unit Error
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <div className="text-xs">
            Failed to load unit data: {unitsError.message}
            <br />
            Unit ID: {unitId}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  // If unit not found, show fallback with more helpful information
  if (!unit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("text-muted-foreground flex items-center gap-1", className)}>
            <Info className="h-3 w-3" />
            Unknown unit
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <div className="text-xs">
            Unit ID {unitId} not found in the system.
            <br />
            This may indicate a data synchronization issue.
            <br />
            Please contact support if this persists.
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  // Determine display text
  const displayText = showFullName ? unit.name : unit.symbol;
  const isInactive = !unit.is_active;
  
  // Build tooltip content
  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-medium">
        {unit.name} ({unit.symbol})
      </div>
      
      {unit.category_name && (
        <div className="text-xs opacity-90">
          Category: {unit.category_name}
        </div>
      )}
      
      {unit.unit_type && (
        <div className="text-xs opacity-90">
          Type: {unit.unit_type}
          {unit.region && ` • ${unit.region}`}
        </div>
      )}
      
      {unit.description && (
        <div className="text-xs opacity-80 max-w-xs">
          {unit.description}
        </div>
      )}
      
      {unit.is_base && (
        <div className="text-xs opacity-90">
          Base unit for {unit.category_name}
        </div>
      )}
      
      {isInactive && (
        <div className="text-xs text-red-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          This unit is deprecated
        </div>
      )}
    </div>
  );
  
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-help",
              showFullName ? nameClassName : symbolClassName,
              isInactive && "text-muted-foreground line-through"
            )}
          >
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
      
      {/* Unit type badge */}
      {showUnitType && unit.unit_type && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0.5 h-auto",
            UNIT_TYPE_COLORS[unit.unit_type] || UNIT_TYPE_COLORS.Other
          )}
        >
          {unit.unit_type}
        </Badge>
      )}
      
      {/* Deprecation warning */}
      {showDeprecationWarning && isInactive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <div className="text-xs">
              This unit is deprecated and may be removed in the future.
              <br />
              Consider using an active unit from the same category.
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ============================================================================
// QUANTITY WITH UNIT DISPLAY COMPONENT
// ============================================================================

interface QuantityWithUnitProps {
  value: number | string;
  unitId: number;
  showFullName?: boolean;
  showUnitType?: boolean;
  showDeprecationWarning?: boolean;
  precision?: number;  // Decimal places for numeric values
  className?: string;
  valueClassName?: string;
  unitClassName?: string;
  separator?: string;  // Separator between value and unit (default: " ")
}

/**
 * QuantityWithUnit Component
 * 
 * Convenience component for displaying a quantity value with its unit.
 * Combines a numeric/string value with UnitDisplay component.
 * 
 * **Validates: Requirements 10.1, 10.2**
 */
export function QuantityWithUnit({
  value,
  unitId,
  showFullName = false,
  showUnitType = false,
  showDeprecationWarning = true,
  precision = 2,
  className,
  valueClassName,
  unitClassName,
  separator = " ",
}: QuantityWithUnitProps) {
  // Format numeric values with specified precision
  const formattedValue = typeof value === 'number' 
    ? value.toFixed(precision).replace(/\.?0+$/, '') // Remove trailing zeros
    : value;
  
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span className={valueClassName}>
        {formattedValue}
      </span>
      <span>{separator}</span>
      <UnitDisplay
        unitId={unitId}
        showFullName={showFullName}
        showUnitType={showUnitType}
        showDeprecationWarning={showDeprecationWarning}
        className={unitClassName}
      />
    </span>
  );
}

// ============================================================================
// UNIT COMPARISON DISPLAY COMPONENT
// ============================================================================

interface UnitComparisonProps {
  fromValue: number;
  fromUnitId: number;
  toValue: number;
  toUnitId: number;
  precision?: number;
  className?: string;
  showArrow?: boolean;
}

/**
 * UnitComparison Component
 * 
 * Display component for showing unit conversions (e.g., "5 kg = 11.02 lbs").
 * Used in conversion results and comparison displays.
 * 
 * **Validates: Requirements 4.4, 11.4**
 */
export function UnitComparison({
  fromValue,
  fromUnitId,
  toValue,
  toUnitId,
  precision = 2,
  className,
  showArrow = true,
}: UnitComparisonProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <QuantityWithUnit
        value={fromValue}
        unitId={fromUnitId}
        precision={precision}
      />
      
      {showArrow && (
        <span className="text-muted-foreground">=</span>
      )}
      
      <QuantityWithUnit
        value={toValue}
        unitId={toUnitId}
        precision={precision}
        className="font-medium"
      />
    </div>
  );
}

export default UnitDisplay;