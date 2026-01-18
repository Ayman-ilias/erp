/**
 * InlineConverter Component
 * 
 * Popover component for inline unit conversion that allows users to convert
 * quantities to different units without changing the original form values.
 * 
 * Features:
 * - Popover with conversion icon button
 * - UnitSelector for target unit selection
 * - Calls useUnitConversion hook on target unit selection
 * - Displays conversion result with formula
 * - Ensures original value remains unchanged
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useUnitConversion, useUnits, type UnitWithCategory } from '@/hooks/use-units';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Loader2, Calculator, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { UnitSelector } from './UnitSelector';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface InlineConverterProps {
  value: number;  // Quantity value
  fromUnitId: number;  // Source unit_id
  categoryName?: string;  // Category for filtering target units
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InlineConverter({
  value,
  fromUnitId,
  categoryName,
  disabled = false,
  className,
}: InlineConverterProps) {
  const [open, setOpen] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState<number | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  
  const { convert, isConverting, convertedValue, error, reset } = useUnitConversion();
  const { data: units = [], error: unitsError } = useUnits();
  
  // Find the source unit for display
  const sourceUnit = units.find((u: UnitWithCategory) => u.id === fromUnitId);
  
  // Handle target unit selection and trigger conversion
  const handleConvert = async (toUnitId: number) => {
    setTargetUnitId(toUnitId);
    
    // Only convert if we have valid values
    if (value && fromUnitId && toUnitId && fromUnitId !== toUnitId) {
      try {
        await convert({
          value,
          fromUnitId,
          toUnitId,
        });
      } catch (err) {
        console.error('Conversion failed:', err);
        // Error is handled by the useUnitConversion hook
      }
    }
  };
  
  // Handle retry for failed conversion
  const handleRetryConversion = async () => {
    if (targetUnitId && value && fromUnitId) {
      setRetryCount(prev => prev + 1);
      await handleConvert(targetUnitId);
    }
  };
  
  // Reset state when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset conversion state when closing
      reset();
      setTargetUnitId(undefined);
      setRetryCount(0);
    }
  };
  
  // Determine if the converter button should be enabled
  const isEnabled = !disabled && value > 0 && fromUnitId > 0 && !unitsError;
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!isEnabled}
          title={
            unitsError 
              ? "Unit data unavailable - cannot convert"
              : !isEnabled 
                ? "Enter a value and select a unit to convert" 
                : "Convert unit"
          }
          className={cn("h-8 w-8", className)}
        >
          {unitsError ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <ArrowRightLeft className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px]" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Unit Converter</h4>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Source value display */}
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Converting from:</div>
            <div className="font-medium">
              {value} {sourceUnit?.symbol || `Unit ${fromUnitId}`}
              {sourceUnit && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({sourceUnit.name})
                </span>
              )}
            </div>
          </div>
          
          {/* Unit Conversion API unavailable error */}
          {unitsError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm font-medium text-destructive mb-1">
                Unit Conversion Service Unavailable
              </div>
              <div className="text-sm text-destructive/80">
                Unable to load unit data. Please try refreshing the page or contact support if the problem persists.
              </div>
            </div>
          )}
          
          {/* Target unit selector */}
          {!unitsError && (
            <div>
              <div className="text-sm font-medium mb-2">Convert to:</div>
              <UnitSelector
                value={targetUnitId}
                onChange={handleConvert}
                categoryFilter={categoryName}
                placeholder="Select target unit..."
                className="w-full"
              />
            </div>
          )}
          
          {/* Loading state */}
          {isConverting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting...
            </div>
          )}
          
          {/* Conversion result */}
          {convertedValue && !isConverting && !error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium text-green-800 mb-2">
                Conversion Result:
              </div>
              <div className="space-y-2">
                {/* Main result */}
                <div className="text-lg font-semibold text-green-900">
                  {value} {convertedValue.from_unit.symbol} = {' '}
                  {typeof convertedValue.result === 'number' 
                    ? convertedValue.result.toFixed(convertedValue.to_unit.decimal_places || 2)
                    : convertedValue.result
                  } {' '}
                  {convertedValue.to_unit.symbol}
                </div>
                
                {/* Unit details */}
                <div className="text-sm text-green-700 space-y-1">
                  <div>
                    <span className="font-medium">From:</span> {convertedValue.from_unit.name}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {convertedValue.to_unit.name}
                  </div>
                </div>
                
                {/* Formula if available */}
                {convertedValue.formula && (
                  <div className="text-xs text-green-600 mt-2 p-2 bg-green-100 rounded border-l-2 border-green-300">
                    <span className="font-medium">Formula:</span> {convertedValue.formula}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Error state with retry option */}
          {error && !isConverting && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm font-medium text-red-800 mb-2">
                Conversion Failed:
              </div>
              <div className="text-sm text-red-700 mb-3">
                {error.includes('incompatible') || error.includes('different categories') 
                  ? 'Cannot convert between units in different categories. Please select units from the same category.'
                  : error.includes('invalid unit') || error.includes('unit_id')
                    ? 'Invalid unit selected. Please choose a different unit.'
                    : error.includes('unavailable') || error.includes('service')
                      ? 'Unit conversion service is temporarily unavailable. Please try again.'
                      : error
                }
              </div>
              {!error.includes('incompatible') && !error.includes('invalid unit') && !error.includes('different categories') && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryConversion}
                    disabled={isConverting}
                    className="text-xs"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry {retryCount > 0 ? `(${retryCount + 1})` : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Same unit selection message */}
          {targetUnitId === fromUnitId && targetUnitId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-700">
                Source and target units are the same. Select a different unit to convert.
              </div>
            </div>
          )}
          
          {/* Help text */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p>
              <strong>Note:</strong> This conversion is for reference only. 
              Your original value ({value} {sourceUnit?.symbol}) remains unchanged.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default InlineConverter;